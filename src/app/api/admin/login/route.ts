import { NextResponse } from "next/server";
import {
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!payload.username || !payload.password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  if (!verifyAdminCredentials(payload.username, payload.password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
