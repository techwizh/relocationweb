import { notFound, redirect } from "next/navigation";
import { BookingTracker } from "@/components/booking-tracker";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";
import { fetchApi } from "@/lib/api-server";

export default async function BookingTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { ok, status, data } = await fetchApi<{
    allowed: boolean;
    reason?: "not_found" | "forbidden" | "payment_required";
    booking?: { id: string };
  }>(`/api/bookings/${id}/access`);

  if (status === 404 || !ok || !data) {
    notFound();
  }

  if (!data.allowed) {
    redirect(
      `/book/access-denied?reason=${data.reason}&next=${encodeURIComponent(`/book/${id}/track`)}`,
    );
  }

  const booking = data.booking;
  if (!booking) {
    notFound();
  }

  return (
    <CustomerPageShell
      eyebrow="Live updates"
      title="Track your move"
      description="See your driver's live location once they start the trip and share GPS from their portal."
      backHref={`/book/${booking.id}/chat`}
      backLabel="Back to chat"
      badges={[
        { icon: "📡", text: "Live GPS" },
        { icon: "🗺️", text: "Map view" },
      ]}
      maxWidth="3xl"
    >
      <MotionFadeUp delay={250}>
        <BookingTracker bookingId={booking.id} />
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
