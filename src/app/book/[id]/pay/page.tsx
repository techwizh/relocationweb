import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPayment } from "@/components/booking-payment";
import { isMpesaConfigured } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";
import { VEHICLE_OPTIONS } from "@/lib/vehicles";

const VEHICLE_LABELS = Object.fromEntries(
  VEHICLE_OPTIONS.map((vehicle) => [vehicle.id.toUpperCase(), vehicle.name]),
) as Record<string, string>;

export default async function BookingPayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!booking) {
    notFound();
  }

  if (booking.status === "PAID" || booking.payment?.status === "COMPLETED") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <h1 className="text-2xl font-bold text-teal-900">Payment complete</h1>
          <p className="mt-2 text-teal-800">
            This booking is already paid
            {booking.payment?.mpesaReceipt
              ? ` (Receipt: ${booking.payment.mpesaReceipt})`
              : "."}
          </p>
          <Link
            href={`/book/${booking.id}/chat`}
            className="mt-6 inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Continue to chat
          </Link>
        </div>
      </div>
    );
  }

  const vehicleKey = booking.vehicleType.toLowerCase();
  const vehicleLabel =
    VEHICLE_LABELS[booking.vehicleType] ??
    VEHICLE_OPTIONS.find((vehicle) => vehicle.id === vehicleKey)?.name ??
    booking.vehicleType;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/book" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to booking
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Pay with M-Pesa</h1>
      <p className="mt-3 text-slate-600">
        Complete payment to confirm your move. You will receive a prompt on{" "}
        {booking.contactPhone}.
      </p>

      <div className="mt-8">
        <BookingPayment
          bookingId={booking.id}
          contactName={booking.contactName}
          contactPhone={booking.contactPhone}
          amount={booking.estimatedPrice}
          vehicleLabel={vehicleLabel}
          pickupSummary={`${booking.pickupSubCounty}, ${booking.pickupWard}`}
          dropoffSummary={`${booking.dropoffSubCounty}, ${booking.dropoffWard}`}
          scheduledAt={booking.scheduledAt.toLocaleDateString("en-KE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          mpesaConfigured={isMpesaConfigured()}
          isSandbox={process.env.MPESA_ENV !== "production"}
        />
      </div>
    </div>
  );
}
