import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingTracker } from "@/components/booking-tracker";
import { getBookingAccessContext } from "@/lib/booking-access";

export default async function BookingTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await getBookingAccessContext(id);

  if (!access.allowed) {
    if (access.reason === "not_found") {
      notFound();
    }

    redirect(
      `/book/access-denied?reason=${access.reason}&next=${encodeURIComponent(`/book/${id}/track`)}`,
    );
  }

  const { booking } = access;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={`/book/${booking.id}/chat`}
        className="text-sm font-medium text-teal-700 hover:underline"
      >
        ← Back to chat
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Track your move</h1>
      <p className="mt-3 text-slate-600">
        See your driver&apos;s live location once they start the trip and share
        GPS from their portal.
      </p>

      <div className="mt-8">
        <BookingTracker bookingId={booking.id} />
      </div>
    </div>
  );
}
