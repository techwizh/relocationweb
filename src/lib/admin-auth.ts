import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "relocate_admin_session";

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "relocate-dev-session-secret";
}

function buildSessionToken(): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:admin-authenticated`)
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

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "techwiz",
    password: process.env.ADMIN_PASSWORD ?? "V3717@ict",
  };
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return (
    safeCompare(username.trim(), credentials.username) &&
    safeCompare(password, credentials.password)
  );
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, buildSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return false;
  return safeCompare(session, buildSessionToken());
}

export async function requireAdmin(): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}
