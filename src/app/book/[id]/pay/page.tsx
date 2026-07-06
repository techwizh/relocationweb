import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPayment } from "@/components/booking-payment";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";
import { fetchApi } from "@/lib/api-server";
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

  const { ok, status, data } = await fetchApi<{
    booking: {
      id: string;
      status: string;
      contactName: string;
      contactPhone: string;
      pickupSubCounty: string;
      pickupWard: string;
      dropoffSubCounty: string;
      dropoffWard: string;
      vehicleType: string;
      estimatedPrice: number;
      scheduledAt: string;
      paymentStatus: string | null;
      mpesaReceipt: string | null;
    };
    mpesaConfigured: boolean;
    isSandbox: boolean;
  }>(`/api/bookings/${id}`);

  if (status === 404 || !ok || !data) {
    notFound();
  }

  const { booking } = data;

  if (booking.status === "PAID" || booking.paymentStatus === "COMPLETED") {
    return (
      <CustomerPageShell
        eyebrow="Payment"
        title="Payment complete"
        description="Your move is confirmed. Head to chat to coordinate with your driver."
        backHref="/book"
        backLabel="Back to booking"
        badges={[
          { icon: "✅", text: "Paid" },
          { icon: "💬", text: "Chat ready" },
        ]}
        maxWidth="2xl"
      >
        <div className="motion-card rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-8 shadow-lg shadow-teal-900/5">
          <p className="text-teal-800">
            This booking is already paid
            {booking.mpesaReceipt ? ` (Receipt: ${booking.mpesaReceipt})` : "."}
          </p>
          <Link
            href={`/book/${booking.id}/chat`}
            className="motion-button mt-6 inline-block rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 hover:from-teal-800 hover:to-cyan-800"
          >
            Continue to chat →
          </Link>
        </div>
      </CustomerPageShell>
    );
  }

  const vehicleKey = booking.vehicleType.toLowerCase();
  const vehicleLabel =
    VEHICLE_LABELS[booking.vehicleType] ??
    VEHICLE_OPTIONS.find((vehicle) => vehicle.id === vehicleKey)?.name ??
    booking.vehicleType;

  return (
    <CustomerPageShell
      eyebrow="Secure checkout"
      title="Pay with M-Pesa"
      description={`Complete payment to confirm your move. You will receive a prompt on ${booking.contactPhone}.`}
      backHref="/book"
      backLabel="Back to booking"
      badges={[
        { icon: "💳", text: "M-Pesa STK push" },
        { icon: "🔒", text: "Secure payment" },
      ]}
      maxWidth="2xl"
    >
      <MotionFadeUp delay={250}>
        <BookingPayment
          bookingId={booking.id}
          contactName={booking.contactName}
          contactPhone={booking.contactPhone}
          amount={booking.estimatedPrice}
          vehicleLabel={vehicleLabel}
          pickupSummary={`${booking.pickupSubCounty}, ${booking.pickupWard}`}
          dropoffSummary={`${booking.dropoffSubCounty}, ${booking.dropoffWard}`}
          scheduledAt={new Date(booking.scheduledAt).toLocaleDateString("en-KE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          mpesaConfigured={data.mpesaConfigured}
          isSandbox={data.isSandbox}
        />
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
