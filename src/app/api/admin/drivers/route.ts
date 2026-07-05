import { NextResponse } from "next/server";
import type { DriverStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { parsePhotoUrls, type DriverReviewRecord } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set<DriverStatus>(["PENDING", "APPROVED", "REJECTED"]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = (searchParams.get("status") ?? "PENDING").toUpperCase() as DriverStatus;

  if (!ALLOWED_STATUSES.has(statusParam)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const drivers = await prisma.driverProfile.findMany({
    where: { status: statusParam },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const records: DriverReviewRecord[] = drivers.map((driver) => ({
    id: driver.id,
    status: driver.status,
    profilePhotoUrl: driver.profilePhotoUrl,
    licenseNumber: driver.licenseNumber,
    licensePhotoUrl: driver.licensePhotoUrl,
    rejectionReason: driver.rejectionReason,
    createdAt: driver.createdAt.toISOString(),
    user: {
      fullName: driver.user.fullName,
      email: driver.user.email,
      contactPhone: driver.user.phone,
    },
    vehicle: driver.vehicle
      ? {
          type: driver.vehicle.type,
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          year: driver.vehicle.year,
          color: driver.vehicle.color,
          plateNumber: driver.vehicle.plateNumber,
          photoUrls: parsePhotoUrls(driver.vehicle.photoUrls),
        }
      : null,
  }));

  return NextResponse.json({ drivers: records });
}
