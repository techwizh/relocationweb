import { NextResponse } from "next/server";
import { completeBookingPayment } from "@/lib/complete-payment";
import { prisma } from "@/lib/prisma";

type CallbackItem = {
  Name: string;
  Value?: string | number;
};

type StkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: CallbackItem[];
      };
    };
  };
};

function getMetadataValue(items: CallbackItem[] | undefined, name: string): string | null {
  const item = items?.find((entry) => entry.Name === name);
  if (item?.Value === undefined || item.Value === null) {
    return null;
  }

  return String(item.Value);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StkCallbackBody;
    const callback = payload.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: callback.CheckoutRequestID },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (callback.ResultCode !== 0) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          resultDesc: callback.ResultDesc ?? "Payment failed.",
        },
      });

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const metadata = callback.CallbackMetadata?.Item;
    const mpesaReceipt = getMetadataValue(metadata, "MpesaReceiptNumber");
    const transactionId = getMetadataValue(metadata, "TransactionDate");

    await completeBookingPayment({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      mpesaReceipt,
      transactionId,
      resultDesc: callback.ResultDesc ?? "Payment successful.",
    });

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
