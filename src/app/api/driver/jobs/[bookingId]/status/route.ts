import { NextResponse } from "next/server";
import type { BookingStatus } from "@prisma/client";
import {
  canTransitionBookingStatus,
  getNextBookingStatus,
} from "@/lib/booking-status";
import { requireDriverUser } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  let driverUser;

  try {
    driverUser = await requireDriverUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (driverUser.driverProfile?.status !== "APPROVED") {
    return NextResponse.json({ error: "Driver is not approved." }, { status: 403 });
  }

  const { bookingId } = await context.params;

  let payload: { status?: BookingStatus };
  try {
    payload = (await request.json()) as { status?: BookingStatus };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const nextStatus = payload.status;
  if (!nextStatus) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.driverId !== driverUser.driverProfile.id) {
    return NextResponse.json({ error: "This job is not assigned to you." }, { status: 403 });
  }

  if (!canTransitionBookingStatus(booking.status, nextStatus)) {
    const expectedNext = getNextBookingStatus(booking.status);
    return NextResponse.json(
      {
        error: expectedNext
          ? `Next step is "${expectedNext.replaceAll("_", " ").toLowerCase()}".`
          : "This job cannot be updated further.",
      },
      { status: 400 },
    );
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: nextStatus },
  });

  return NextResponse.json({
    message: "Job status updated.",
    status: updated.status,
  });
}
