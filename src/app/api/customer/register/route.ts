import { NextResponse } from "next/server";
import { createCustomerSession } from "@/lib/customer-auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  const fullName = payload.fullName?.trim();
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";
  const phone = payload.phone ? normalizeKenyanPhone(payload.phone) : "";

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!phone || !isValidKenyanPhone(phone)) {
    return NextResponse.json({ error: "A valid Kenyan phone number is required." }, { status: 400 });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          password: hashPassword(password),
          fullName,
          phone,
          role: "CUSTOMER",
        },
      });

      await tx.booking.updateMany({
        where: {
          contactPhone: phone,
          customerId: null,
        },
        data: {
          customerId: created.id,
        },
      });

      return created;
    });

    await createCustomerSession(user.id);

    return NextResponse.json({
      ok: true,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      if (target.includes("email")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      if (target.includes("phone")) {
        return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
      }
    }

    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
