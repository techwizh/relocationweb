import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getLandingContent,
  updateLandingContent,
  type LandingContent,
} from "@/lib/landing-content";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const content = await getLandingContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as { content?: LandingContent };

  if (!payload.content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const content = await updateLandingContent(payload.content);
  return NextResponse.json({ content });
}
