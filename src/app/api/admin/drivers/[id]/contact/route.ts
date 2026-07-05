import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as { phone?: string };
  const phone = payload.phone ? normalizeKenyanPhone(payload.phone) : "";

  if (!phone || !isValidKenyanPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid Kenyan phone number for driver contact." },
      { status: 400 },
    );
  }

  const driver = await prisma.driverProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!driver) {
    return NextResponse.json({ error: "Driver not found." }, { status: 404 });
  }

  if (driver.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Contact phone can only be set for approved drivers." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: driver.userId },
    data: { phone },
  });

  return NextResponse.json({
    message: "Driver contact phone saved.",
    phone,
  });
}
