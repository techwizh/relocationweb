import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const today = startOfToday();

  const [pendingDrivers, todaysBookings, liveVehicles] = await Promise.all([
    prisma.driverProfile.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { createdAt: { gte: today } } }),
    prisma.driverProfile.count({
      where: { status: "APPROVED", isAvailable: true },
    }),
  ]);

  return NextResponse.json({
    pendingDrivers,
    todaysBookings,
    liveVehicles,
  });
}
