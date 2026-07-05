import { NextResponse } from "next/server";
import { initiateStkPush, MpesaConfigError } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status === "PAID") {
      return NextResponse.json({
        status: "COMPLETED",
        message: "This booking is already paid.",
      });
    }

    if (booking.payment?.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        message: "Payment already completed.",
      });
    }

    if (booking.payment?.status === "PENDING" && booking.payment.checkoutRequestId) {
      return NextResponse.json({
        status: "PENDING",
        checkoutRequestId: booking.payment.checkoutRequestId,
        message:
          "Payment already in progress. Enter PIN 174379 on your phone, or wait for confirmation.",
      });
    }

    const stkResult = await initiateStkPush({
      phone: booking.contactPhone,
      amount: booking.estimatedPrice,
      bookingId: booking.id,
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.estimatedPrice,
        phoneNumber: booking.contactPhone,
        checkoutRequestId: stkResult.checkoutRequestId,
        merchantRequestId: stkResult.merchantRequestId,
        status: "PENDING",
      },
      update: {
        amount: booking.estimatedPrice,
        phoneNumber: booking.contactPhone,
        checkoutRequestId: stkResult.checkoutRequestId,
        merchantRequestId: stkResult.merchantRequestId,
        status: "PENDING",
        resultDesc: null,
        mpesaReceipt: null,
        transactionId: null,
      },
    });

    return NextResponse.json({
      status: "PENDING",
      checkoutRequestId: stkResult.checkoutRequestId,
      message: stkResult.customerMessage,
    });
  } catch (error) {
    if (error instanceof MpesaConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message =
      error instanceof Error ? error.message : "Could not start M-Pesa payment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
