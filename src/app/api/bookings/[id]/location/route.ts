import { NextResponse } from "next/server";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-display";
import { requireBookingAccess } from "@/lib/booking-access";
import { TRACKABLE_BOOKING_STATUSES } from "@/lib/booking-status";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await requireBookingAccess(id);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "forbidden";
    return NextResponse.json(
      { error: "You do not have access to this booking." },
      { status: reason === "not_found" ? 404 : 403 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      driver: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (!booking.driverId) {
    return NextResponse.json({
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      trackingAvailable: false,
      message: "A driver has not been assigned yet.",
    });
  }

  if (!TRACKABLE_BOOKING_STATUSES.includes(booking.status)) {
    return NextResponse.json({
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      trackingAvailable: false,
      message: "Live tracking is not available for this booking yet.",
    });
  }

  const location = await prisma.locationUpdate.findFirst({
    where: { bookingId: booking.id },
    orderBy: { createdAt: "desc" },
  });

  if (!location) {
    return NextResponse.json({
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      trackingAvailable: true,
      driverName: booking.driver?.user.fullName ?? "Assigned driver",
      pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
      dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
      location: null,
      message: "Waiting for the driver to share their location.",
    });
  }

  return NextResponse.json({
    status: booking.status,
    statusLabel: BOOKING_STATUS_LABELS[booking.status],
    trackingAvailable: true,
    driverName: booking.driver?.user.fullName ?? "Assigned driver",
    pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
    dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
    location: {
      lat: location.lat,
      lng: location.lng,
      updatedAt: location.createdAt.toISOString(),
    },
  });
}
