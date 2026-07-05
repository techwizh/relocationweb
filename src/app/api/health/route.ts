import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "relocate-api",
    timestamp: new Date().toISOString(),
  });
}
