import { NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/customer-auth";
import { isMpesaConfigured } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";
import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_PREFIX = "relocate_booking_";

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "relocate-dev-session-secret";
}

function buildBookingAccessToken(bookingId: string): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${bookingId}:booking-access`)
    .digest("hex");
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

async function hasGuestBookingAccess(bookingId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(`${COOKIE_PREFIX}${bookingId}`)?.value;
  if (!token) return false;
  return safeCompare(token, buildBookingAccessToken(bookingId));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const customer = await getCustomerUser();
  const isOwner = customer && booking.customerId === customer.id;
  const hasGuestAccess = await hasGuestBookingAccess(id);

  if (!isOwner && !hasGuestAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      pickupSubCounty: booking.pickupSubCounty,
      pickupWard: booking.pickupWard,
      dropoffSubCounty: booking.dropoffSubCounty,
      dropoffWard: booking.dropoffWard,
      vehicleType: booking.vehicleType,
      estimatedPrice: booking.estimatedPrice,
      scheduledAt: booking.scheduledAt.toISOString(),
      paymentStatus: booking.payment?.status ?? null,
      mpesaReceipt: booking.payment?.mpesaReceipt ?? null,
    },
    mpesaConfigured: isMpesaConfigured(),
    isSandbox: process.env.MPESA_ENV !== "production",
  });
}
