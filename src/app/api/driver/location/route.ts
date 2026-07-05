import { NextResponse } from "next/server";
import { requireDriverUser } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let driverUser;

  try {
    driverUser = await requireDriverUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (driverUser.driverProfile?.status !== "APPROVED") {
    return NextResponse.json({ error: "Driver is not approved." }, { status: 403 });
  }

  let payload: {
    lat?: number;
    lng?: number;
    bookingId?: string | null;
    mode?: "AVAILABLE" | "ACTIVE_JOB";
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lat = payload.lat;
  const lng = payload.lng;
  const mode = payload.mode;
  const bookingId = payload.bookingId ?? null;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Valid lat and lng are required." }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Coordinates are out of range." }, { status: 400 });
  }

  if (mode !== "AVAILABLE" && mode !== "ACTIVE_JOB") {
    return NextResponse.json({ error: "Mode must be AVAILABLE or ACTIVE_JOB." }, { status: 400 });
  }

  if (mode === "ACTIVE_JOB") {
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required for active job tracking." },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.driverId !== driverUser.driverProfile.id) {
      return NextResponse.json({ error: "Active job not found." }, { status: 404 });
    }
  }

  const update = await prisma.locationUpdate.create({
    data: {
      driverId: driverUser.driverProfile.id,
      bookingId: mode === "ACTIVE_JOB" ? bookingId : null,
      lat,
      lng,
      mode,
    },
  });

  return NextResponse.json({
    ok: true,
    recordedAt: update.createdAt.toISOString(),
  });
}
