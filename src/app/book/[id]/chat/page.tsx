import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingChat } from "@/components/booking-chat";
import { getBookingAccessContext } from "@/lib/booking-access";

export default async function BookingChatPage({
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
      `/book/access-denied?reason=${access.reason}&next=${encodeURIComponent(`/book/${id}/chat`)}`,
    );
  }

  const { booking, role } = access;
  const chatRole = role === "DRIVER" ? "DRIVER" : "CUSTOMER";
  const senderName =
    chatRole === "DRIVER" ? "Assigned driver" : booking.contactName;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={chatRole === "DRIVER" ? "/driver/dashboard" : "/account"}
        className="text-sm font-medium text-teal-700 hover:underline"
      >
        ← Back
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Booking chat</h1>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-800">From:</span>{" "}
          {booking.pickupSubCounty}, {booking.pickupWard}
        </p>
        <p className="mt-1">
          <span className="font-medium text-slate-800">To:</span>{" "}
          {booking.dropoffSubCounty}, {booking.dropoffWard}
        </p>
        {booking.notes ? (
          <p className="mt-1">
            <span className="font-medium text-slate-800">Notes:</span>{" "}
            {booking.notes}
          </p>
        ) : null}
        <p className="mt-1">
          <span className="font-medium text-slate-800">Contact phone:</span>{" "}
          {role === "CUSTOMER"
            ? booking.contactPhone
            : "Hidden — use chat below"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {role === "CUSTOMER" ? (
          <>
            <Link
              href={`/book/${booking.id}/track`}
              className="font-medium text-teal-700 hover:underline"
            >
              Track driver live
            </Link>
            <Link href="/account" className="font-medium text-slate-600 hover:underline">
              My bookings
            </Link>
          </>
        ) : null}
      </div>

      <div className="mt-6">
        <BookingChat bookingId={booking.id} role={chatRole} senderName={senderName} />
      </div>
    </div>
  );
}
