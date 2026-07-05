import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ReviewAction = "approve" | "reject";

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

  let body: { action?: ReviewAction; rejectionReason?: string };
  try {
    body = (await request.json()) as { action?: ReviewAction; rejectionReason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json(
      { error: 'Action must be "approve" or "reject".' },
      { status: 400 },
    );
  }

  const driver = await prisma.driverProfile.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!driver) {
    return NextResponse.json({ error: "Driver not found." }, { status: 404 });
  }

  if (body.action === "approve") {
    if (driver.status === "APPROVED") {
      return NextResponse.json({ message: "Driver is already approved." });
    }

    await prisma.driverProfile.update({
      where: { id },
      data: {
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    return NextResponse.json({ message: "Driver approved." });
  }

  const rejectionReason = body.rejectionReason?.trim();
  if (!rejectionReason) {
    return NextResponse.json(
      { error: "A rejection reason is required." },
      { status: 400 },
    );
  }

  await prisma.driverProfile.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason,
      isAvailable: false,
    },
  });

  return NextResponse.json({ message: "Driver rejected." });
}
