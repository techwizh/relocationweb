import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api-server";
import { isSplitDeploy } from "@/lib/api-url";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "relocate_customer_session";

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "relocate-dev-session-secret";
}

function buildSessionToken(userId: string): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${userId}:customer-authenticated`)
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

export async function createCustomerSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}.${buildSessionToken(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCustomerSession(): Promise<{ userId: string } | null> {
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

export async function getCustomerUser() {
  const session = await getCustomerSession();
  if (!session) {
    return null;
  }

  if (isSplitDeploy()) {
    const { ok, data } = await fetchApi<{
      user: {
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: "CUSTOMER" | "DRIVER" | "ADMIN";
      };
    }>("/api/customer/me");

    if (!ok || !data?.user) {
      return null;
    }

    return data.user;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
  });
}

export async function requireCustomerUser() {
  const user = await getCustomerUser();

  if (!user || user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }

  return user;
}
