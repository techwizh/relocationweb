import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getCustomerUser } from "@/lib/customer-auth";
import { getDriverUser } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

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

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function grantBookingAccess(bookingId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${COOKIE_PREFIX}${bookingId}`, buildBookingAccessToken(bookingId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

async function hasGuestBookingAccess(bookingId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(`${COOKIE_PREFIX}${bookingId}`)?.value;

  if (!token) {
    return false;
  }

  return safeCompare(token, buildBookingAccessToken(bookingId));
}

export type BookingAccessContext =
  | {
      allowed: true;
      role: UserRole;
      booking: NonNullable<Awaited<ReturnType<typeof prisma.booking.findUnique>>>;
    }
  | {
      allowed: false;
      reason: "not_found" | "forbidden" | "payment_required";
    };

export async function getBookingAccessContext(
  bookingId: string,
): Promise<BookingAccessContext> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    return { allowed: false, reason: "not_found" };
  }

  if (
    booking.status === "DRAFT" ||
    booking.status === "PENDING_PAYMENT" ||
    booking.status === "CANCELLED"
  ) {
    return { allowed: false, reason: "payment_required" };
  }

  const customer = await getCustomerUser();
  if (customer && booking.customerId === customer.id) {
    return { allowed: true, role: "CUSTOMER", booking };
  }

  const driverUser = await getDriverUser();
  if (
    driverUser?.driverProfile &&
    booking.driverId === driverUser.driverProfile.id
  ) {
    return { allowed: true, role: "DRIVER", booking };
  }

  if (await hasGuestBookingAccess(bookingId)) {
    return { allowed: true, role: "CUSTOMER", booking };
  }

  return { allowed: false, reason: "forbidden" };
}

export async function requireBookingAccess(bookingId: string) {
  const access = await getBookingAccessContext(bookingId);

  if (!access.allowed) {
    throw new Error(access.reason);
  }

  return access;
}
