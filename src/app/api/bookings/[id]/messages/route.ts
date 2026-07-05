import { NextResponse } from "next/server";
import { requireBookingAccess } from "@/lib/booking-access";
import { validateChatMessage } from "@/lib/chat-filter";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

type MessagePayload = {
  body: string;
  senderRole: UserRole;
  senderName: string;
};

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
      { error: "You do not have access to this booking chat." },
      { status: reason === "not_found" ? 404 : 403 },
    );
  }

  const messages = await prisma.chatMessage.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let access;
  try {
    access = await requireBookingAccess(id);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "forbidden";
    return NextResponse.json(
      { error: "You do not have access to this booking chat." },
      { status: reason === "not_found" ? 404 : 403 },
    );
  }

  const payload = (await request.json()) as MessagePayload;
  const validation = validateChatMessage(payload.body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (payload.senderRole !== access.role) {
    return NextResponse.json({ error: "Invalid sender role for this session." }, { status: 403 });
  }

  const senderName =
    access.role === "DRIVER"
      ? "Assigned driver"
      : access.booking.contactName;

  const message = await prisma.chatMessage.create({
    data: {
      bookingId: id,
      senderRole: access.role,
      senderName,
      body: payload.body.trim(),
    },
  });

  return NextResponse.json({ message });
}
