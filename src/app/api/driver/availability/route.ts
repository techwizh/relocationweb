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
    return NextResponse.json(
      { error: "Only approved drivers can change availability." },
      { status: 403 },
    );
  }

  const payload = (await request.json()) as { isAvailable?: boolean };

  if (typeof payload.isAvailable !== "boolean") {
    return NextResponse.json({ error: "isAvailable must be true or false." }, { status: 400 });
  }

  const profile = await prisma.driverProfile.update({
    where: { id: driverUser.driverProfile.id },
    data: { isAvailable: payload.isAvailable },
    select: { isAvailable: true },
  });

  return NextResponse.json({
    isAvailable: profile.isAvailable,
    message: profile.isAvailable
      ? "You are now available for new jobs."
      : "You are now offline.",
  });
}
