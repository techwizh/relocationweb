import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "relocate_driver_session";

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "relocate-dev-session-secret";
}

function buildSessionToken(userId: string): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${userId}:driver-authenticated`)
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

export async function createDriverSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}.${buildSessionToken(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDriverSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getDriverSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const separatorIndex = value.indexOf(".");
  if (separatorIndex === -1) {
    return null;
  }

  const userId = value.slice(0, separatorIndex);
  const token = value.slice(separatorIndex + 1);

  if (!userId || !token || !safeCompare(token, buildSessionToken(userId))) {
    return null;
  }

  return { userId };
}

export async function getDriverUser() {
  const session = await getDriverSession();
  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      driverProfile: {
        include: {
          vehicle: true,
        },
      },
    },
  });
}

export async function requireDriverUser() {
  const user = await getDriverUser();

  if (!user || user.role !== "DRIVER" || !user.driverProfile) {
    throw new Error("Unauthorized");
  }

  return user;
}
