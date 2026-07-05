import { NextResponse } from "next/server";
import { toDriverJobRecord } from "@/lib/booking-display";
import { requireDriverUser } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let user;

  try {
    user = await requireDriverUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const jobs = await prisma.booking.findMany({
    where: {
      driverId: user.driverProfile!.id,
      status: {
        in: ["ASSIGNED", "EN_ROUTE", "LOADING", "IN_TRANSIT", "DELIVERED"],
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      driverProfile: {
        status: user.driverProfile!.status,
        rejectionReason: user.driverProfile!.rejectionReason,
        isAvailable: user.driverProfile!.isAvailable,
        vehicle: user.driverProfile!.vehicle
          ? {
              type: user.driverProfile!.vehicle.type,
              make: user.driverProfile!.vehicle.make,
              model: user.driverProfile!.vehicle.model,
              plateNumber: user.driverProfile!.vehicle.plateNumber,
            }
          : null,
      },
    },
    jobs: jobs.map(toDriverJobRecord),
  });
}
