import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as { driverId?: string };
  const driverId = payload.driverId?.trim();

  if (!driverId) {
    return NextResponse.json({ error: "Select a driver to assign." }, { status: 400 });
  }

  const [booking, driver] = await Promise.all([
    prisma.booking.findUnique({ where: { id } }),
    prisma.driverProfile.findUnique({
      where: { id: driverId },
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (!driver) {
    return NextResponse.json({ error: "Driver not found." }, { status: 404 });
  }

  if (driver.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Only approved drivers can be assigned." },
      { status: 400 },
    );
  }

  if (booking.status !== "PAID" && booking.status !== "ASSIGNED") {
    return NextResponse.json(
      { error: "Only paid bookings can be assigned to a driver." },
      { status: 400 },
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      driverId: driver.id,
      status: "ASSIGNED",
    },
  });

  return NextResponse.json({
    message: `Assigned to ${driver.user.fullName}.`,
    bookingId: updated.id,
    driverId: driver.id,
  });
}
