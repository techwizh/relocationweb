import { NextResponse } from "next/server";
import { getBookingAccessContext } from "@/lib/booking-access";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const access = await getBookingAccessContext(id);

  if (!access.allowed) {
    return NextResponse.json(
      { allowed: false, reason: access.reason },
      { status: access.reason === "not_found" ? 404 : 403 },
    );
  }

  const { booking, role } = access;

  return NextResponse.json({
    allowed: true,
    role,
    booking: {
      id: booking.id,
      status: booking.status,
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      pickupSubCounty: booking.pickupSubCounty,
      pickupWard: booking.pickupWard,
      dropoffSubCounty: booking.dropoffSubCounty,
      dropoffWard: booking.dropoffWard,
      notes: booking.notes,
      vehicleType: booking.vehicleType,
      estimatedPrice: booking.estimatedPrice,
      scheduledAt: booking.scheduledAt.toISOString(),
    },
  });
}
