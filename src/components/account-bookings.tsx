"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@prisma/client";

export type CustomerBookingRecord = {
  id: string;
  status: BookingStatus;
  statusLabel: string;
  contactName: string;
  pickupSummary: string;
  dropoffSummary: string;
  scheduledAt: string;
  estimatedPrice: number;
  vehicleLabel: string;
  driverName: string | null;
  createdAt: string;
};

type AccountBookingsProps = {
  fullName: string;
  email: string;
  phone: string | null;
  bookings: CustomerBookingRecord[];
};

export function AccountBookings({
  fullName,
  email,
  phone,
  bookings,
}: AccountBookingsProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" });
    router.push("/login?type=customer");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
          <p className="text-sm text-slate-600">{email}</p>
          {phone ? <p className="text-sm text-slate-600">{phone}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">My bookings</h2>
          <Link
            href="/book"
            className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Book a move
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No bookings yet. Book your first move or register with the same
            phone number you used for a guest booking.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {booking.pickupSummary} → {booking.dropoffSummary}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(booking.scheduledAt).toLocaleDateString("en-KE", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                    {booking.statusLabel}
                  </span>
                </div>

                <dl className="mt-3 space-y-1 text-sm text-slate-600">
                  <div>
                    <dt className="inline font-medium text-slate-800">Vehicle: </dt>
                    <dd className="inline">{booking.vehicleLabel}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-slate-800">Amount: </dt>
                    <dd className="inline">
                      KES {booking.estimatedPrice.toLocaleString()}
                    </dd>
                  </div>
                  {booking.driverName ? (
                    <div>
                      <dt className="inline font-medium text-slate-800">Driver: </dt>
                      <dd className="inline">{booking.driverName}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/book/${booking.id}/chat`}
                    className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Chat
                  </Link>
                  {booking.status !== "PENDING_PAYMENT" && booking.status !== "CANCELLED" ? (
                    <Link
                      href={`/book/${booking.id}/track`}
                      className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Track driver
                    </Link>
                  ) : null}
                  {booking.status === "PENDING_PAYMENT" ? (
                    <Link
                      href={`/book/${booking.id}/pay`}
                      className="rounded-full border border-amber-300 px-5 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
                    >
                      Complete payment
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
