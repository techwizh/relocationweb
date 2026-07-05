import { prisma } from "@/lib/prisma";

export async function completeBookingPayment(input: {
  paymentId: string;
  bookingId: string;
  mpesaReceipt?: string | null;
  transactionId?: string | null;
  resultDesc?: string | null;
}) {
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: "COMPLETED",
        mpesaReceipt: input.mpesaReceipt ?? null,
        transactionId: input.transactionId ?? null,
        resultDesc: input.resultDesc ?? "Payment successful.",
      },
    }),
    prisma.booking.update({
      where: { id: input.bookingId },
      data: { status: "PAID" },
    }),
  ]);
}
