import { NextResponse } from "next/server";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-display";
import { requireCustomerUser } from "@/lib/customer-auth";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let user;

  try {
    user = await requireCustomerUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    include: {
      driver: {
        include: {
          user: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    user: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    },
    bookings: bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      contactName: booking.contactName,
      pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
      dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
      scheduledAt: booking.scheduledAt.toISOString(),
      estimatedPrice: booking.estimatedPrice,
      vehicleLabel: VEHICLE_TYPE_LABELS[booking.vehicleType],
      driverName: booking.driver?.user.fullName ?? null,
      createdAt: booking.createdAt.toISOString(),
    })),
  });
}
