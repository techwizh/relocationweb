import { NextResponse } from "next/server";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-display";
import { requireAdmin } from "@/lib/admin-auth";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [bookings, approvedDrivers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: {
          in: ["PAID", "ASSIGNED", "EN_ROUTE", "LOADING", "IN_TRANSIT"],
        },
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.driverProfile.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        vehicle: {
          select: {
            type: true,
            plateNumber: true,
          },
        },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
  ]);

  return NextResponse.json({
    bookings: bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      city: booking.city,
      pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
      dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
      scheduledAt: booking.scheduledAt.toISOString(),
      estimatedPrice: booking.estimatedPrice,
      vehicleType: booking.vehicleType,
      vehicleLabel: VEHICLE_TYPE_LABELS[booking.vehicleType],
      notes: booking.notes,
      driverId: booking.driverId,
      driverName: booking.driver?.user.fullName ?? null,
    })),
    approvedDrivers: approvedDrivers.map((driver) => ({
      id: driver.id,
      fullName: driver.user.fullName,
      plateNumber: driver.vehicle?.plateNumber ?? null,
      vehicleType: driver.vehicle?.type ?? null,
      isAvailable: driver.isAvailable,
    })),
  });
}
