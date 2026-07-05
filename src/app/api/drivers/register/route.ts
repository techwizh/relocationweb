import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, validateImageFile } from "@/lib/uploads";
import type { VehicleTypeId } from "@/lib/vehicles";
import { getVehicleById } from "@/lib/vehicles";
import type { VehicleType } from "@prisma/client";
import { Prisma } from "@prisma/client";

const VEHICLE_MAP: Record<VehicleTypeId, VehicleType> = {
  van: "VAN",
  pickup: "PICKUP",
  canter: "CANTER",
  lorry: "LORRY",
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function normalizePlateNumber(plate: string): string {
  return plate.replace(/\s+/g, " ").trim().toUpperCase();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = getString(formData, "fullName");
    const email = getString(formData, "email").toLowerCase();
    const password = getString(formData, "password");
    const licenseNumber = getString(formData, "licenseNumber");
    const vehicleTypeId = getString(formData, "vehicleType") as VehicleTypeId;
    const make = getString(formData, "make");
    const model = getString(formData, "model");
    const color = getString(formData, "color");
    const plateNumber = normalizePlateNumber(getString(formData, "plateNumber"));
    const yearRaw = getString(formData, "year");
    const year = Number.parseInt(yearRaw, 10);

    const profilePhoto = formData.get("profilePhoto");
    const licensePhoto = formData.get("licensePhoto");
    const vehiclePhotos = getFiles(formData, "vehiclePhotos");

    if (!fullName) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!licenseNumber) {
      return NextResponse.json({ error: "Driving license number is required." }, { status: 400 });
    }

    if (!getVehicleById(vehicleTypeId)) {
      return NextResponse.json({ error: "Select a valid vehicle type." }, { status: 400 });
    }

    if (!make || !model || !color || !plateNumber) {
      return NextResponse.json(
        { error: "Vehicle make, model, color, and plate number are required." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Enter a valid vehicle year." }, { status: 400 });
    }

    if (!(profilePhoto instanceof File)) {
      return NextResponse.json({ error: "Profile photo is required." }, { status: 400 });
    }

    if (!(licensePhoto instanceof File)) {
      return NextResponse.json({ error: "Driving license photo is required." }, { status: 400 });
    }

    if (vehiclePhotos.length < 1) {
      return NextResponse.json(
        { error: "Upload at least one vehicle photo." },
        { status: 400 },
      );
    }

    if (vehiclePhotos.length > 5) {
      return NextResponse.json(
        { error: "Upload up to 5 vehicle photos." },
        { status: 400 },
      );
    }

    for (const file of [profilePhoto, licensePhoto, ...vehiclePhotos]) {
      const validationError = validateImageFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const profilePhotoUrl = await saveUploadedImage(profilePhoto, "uploads/drivers");
    const licensePhotoUrl = await saveUploadedImage(licensePhoto, "uploads/drivers");
    const vehiclePhotoUrls = await Promise.all(
      vehiclePhotos.map((file) => saveUploadedImage(file, "uploads/drivers")),
    );

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashPassword(password),
          fullName,
          role: "DRIVER",
        },
      });

      const driverProfile = await tx.driverProfile.create({
        data: {
          userId: user.id,
          profilePhotoUrl,
          licenseNumber,
          licensePhotoUrl,
          status: "PENDING",
        },
      });

      await tx.vehicle.create({
        data: {
          driverId: driverProfile.id,
          type: VEHICLE_MAP[vehicleTypeId],
          make,
          model,
          year,
          color,
          plateNumber,
          photoUrls: JSON.stringify(vehiclePhotoUrls),
        },
      });
    });

    return NextResponse.json({
      message: "Application submitted. An admin will review your details.",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : String(error.meta?.target ?? "field");

      if (target.includes("email")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }

      if (target.includes("plateNumber")) {
        return NextResponse.json(
          { error: "This plate number is already registered." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Could not submit driver registration. Try again." },
      { status: 500 },
    );
  }
}
