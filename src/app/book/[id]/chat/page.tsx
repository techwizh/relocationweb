import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingChat } from "@/components/booking-chat";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";
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
    <CustomerPageShell
      eyebrow="Stay connected"
      title="Booking chat"
      description="Coordinate pickup details, parking, and loading with your driver — all in one place."
      backHref={chatRole === "DRIVER" ? "/driver/dashboard" : "/account"}
      backLabel="Back"
      badges={[
        { icon: "📍", text: `${booking.pickupSubCounty} → ${booking.dropoffSubCounty}` },
        { icon: "💬", text: "Real-time messages" },
      ]}
      maxWidth="3xl"
    >
      <MotionFadeUp delay={250}>
        <div className="motion-card rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-lg shadow-teal-900/5">
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-teal-800">From:</span>{" "}
              {booking.pickupSubCounty}, {booking.pickupWard}
            </p>
            <p>
              <span className="font-semibold text-teal-800">To:</span>{" "}
              {booking.dropoffSubCounty}, {booking.dropoffWard}
            </p>
            {booking.notes ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-teal-800">Notes:</span>{" "}
                {booking.notes}
              </p>
            ) : null}
            <p className="sm:col-span-2">
              <span className="font-semibold text-teal-800">Contact phone:</span>{" "}
              {role === "CUSTOMER"
                ? booking.contactPhone
                : "Hidden — use chat below"}
            </p>
          </div>
        </div>
      </MotionFadeUp>

      {role === "CUSTOMER" ? (
        <MotionFadeUp delay={300}>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/book/${booking.id}/track`}
              className="motion-button inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-cyan-700 hover:to-teal-700"
            >
              <span aria-hidden>📡</span>
              Track driver live
            </Link>
            <Link
              href="/account"
              className="rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
            >
              My bookings
            </Link>
          </div>
        </MotionFadeUp>
      ) : null}

      <MotionFadeUp delay={350}>
        <div className="mt-6">
          <BookingChat bookingId={booking.id} role={chatRole} senderName={senderName} />
        </div>
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
