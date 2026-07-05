import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingChat } from "@/components/booking-chat";
import { fetchApi } from "@/lib/api-server";

export default async function BookingChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { ok, status, data } = await fetchApi<{
    allowed: boolean;
    reason?: "not_found" | "forbidden" | "payment_required";
    role?: "CUSTOMER" | "DRIVER";
    booking?: {
      id: string;
      contactName: string;
      contactPhone: string;
      pickupSubCounty: string;
      pickupWard: string;
      dropoffSubCounty: string;
      dropoffWard: string;
      notes: string | null;
    };
  }>(`/api/bookings/${id}/access`);

  if (status === 404 || !ok || !data) {
    notFound();
  }

  if (!data.allowed) {
    redirect(
      `/book/access-denied?reason=${data.reason}&next=${encodeURIComponent(`/book/${id}/chat`)}`,
    );
  }

  const { booking, role } = data;
  if (!booking || !role) {
    notFound();
  }

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
