import { NextResponse } from "next/server";
import { requireCustomerUser } from "@/lib/customer-auth";

export async function GET() {
  try {
    const user = await requireCustomerUser();
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
