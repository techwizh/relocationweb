import { NextResponse } from "next/server";
import { getLandingContent } from "@/lib/landing-content";

export async function GET() {
  const content = await getLandingContent();
  return NextResponse.json({ content });
}
