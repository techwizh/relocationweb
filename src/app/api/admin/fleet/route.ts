import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const drivers = await prisma.driverProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: {
        select: { fullName: true },
      },
      vehicle: {
        select: {
          type: true,
          plateNumber: true,
        },
      },
      locationUpdates: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      assignedBookings: {
        where: {
          status: {
            in: ["ASSIGNED", "EN_ROUTE", "LOADING", "IN_TRANSIT"],
          },
        },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  return NextResponse.json({
    drivers: drivers.map((driver) => {
      const latestLocation = driver.locationUpdates[0] ?? null;

      return {
        id: driver.id,
        fullName: driver.user.fullName,
        isAvailable: driver.isAvailable,
        onActiveJob: driver.assignedBookings.length > 0,
        vehicleLabel: driver.vehicle
          ? `${VEHICLE_TYPE_LABELS[driver.vehicle.type]} (${driver.vehicle.plateNumber})`
          : null,
        location: latestLocation
          ? {
              lat: latestLocation.lat,
              lng: latestLocation.lng,
              mode: latestLocation.mode,
              updatedAt: latestLocation.createdAt.toISOString(),
            }
          : null,
      };
    }),
  });
}
