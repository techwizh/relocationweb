import { NextResponse } from "next/server";
import { completeBookingPayment } from "@/lib/complete-payment";
import { queryStkPushStatus } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (!booking.payment) {
    return NextResponse.json({
      status: "NOT_STARTED",
      bookingStatus: booking.status,
    });
  }

  if (
    booking.payment.status === "PENDING" &&
    booking.payment.checkoutRequestId &&
    booking.status !== "PAID"
  ) {
    const secondsSinceUpdate =
      (Date.now() - booking.payment.updatedAt.getTime()) / 1000;

    // Daraja sandbox often returns 403 if STK Query is called too soon.
    if (secondsSinceUpdate < 15) {
      return NextResponse.json({
        status: "PENDING",
        message: "Waiting for M-Pesa to process the request...",
        amount: booking.payment.amount,
        bookingStatus: booking.status,
      });
    }

    try {
      const query = await queryStkPushStatus(booking.payment.checkoutRequestId);

      if (query.resultCode === "0") {
        await completeBookingPayment({
          paymentId: booking.payment.id,
          bookingId: booking.id,
          resultDesc: query.resultDesc,
        });

        const updated = await prisma.payment.findUnique({
          where: { id: booking.payment.id },
        });

        return NextResponse.json({
          status: "COMPLETED",
          message: query.resultDesc,
          receipt: updated?.mpesaReceipt,
          amount: booking.payment.amount,
          bookingStatus: "PAID",
        });
      }

      if (query.resultCode === "1032") {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: "FAILED",
            resultDesc: query.resultDesc,
          },
        });

        return NextResponse.json({
          status: "FAILED",
          message: query.resultDesc,
          bookingStatus: booking.status,
        });
      }
    } catch {
      // Callback may still arrive; keep polling.
    }
  }

  return NextResponse.json({
    status: booking.payment.status,
    message: booking.payment.resultDesc,
    receipt: booking.payment.mpesaReceipt,
    amount: booking.payment.amount,
    bookingStatus: booking.status,
  });
}
