"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminBookingRecord = {
  id: string;
  status: string;
  statusLabel: string;
  contactName: string;
  contactPhone: string;
  city: string;
  pickupSummary: string;
  dropoffSummary: string;
  scheduledAt: string;
  estimatedPrice: number;
  vehicleLabel: string;
  notes: string | null;
  driverId: string | null;
  driverName: string | null;
};

type ApprovedDriverOption = {
  id: string;
  fullName: string;
  plateNumber: string | null;
  isAvailable: boolean;
};

type BookingAssignmentPanelProps = {
  initialBookings: AdminBookingRecord[];
  initialDrivers: ApprovedDriverOption[];
};

export function BookingAssignmentPanel({
  initialBookings,
  initialDrivers,
}: BookingAssignmentPanelProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [drivers] = useState(initialDrivers);
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function reloadBookings() {
    const response = await fetch("/api/admin/bookings");
    const data = (await response.json()) as {
      bookings?: AdminBookingRecord[];
      error?: string;
    };

    if (response.ok && data.bookings) {
      setBookings(data.bookings);
    }
  }

  async function handleAssign(bookingId: string) {
    const driverId = selectedDrivers[bookingId];
    if (!driverId) {
      setError("Select a driver before assigning.");
      return;
    }

    setProcessingId(bookingId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not assign booking.");
        return;
      }

      setMessage(data.message ?? "Booking assigned.");
      await reloadBookings();
      router.refresh();
    } catch {
      setError("Could not assign booking.");
    } finally {
      setProcessingId(null);
    }
  }

  const unassignedBookings = bookings.filter(
    (booking) => booking.status === "PAID" && !booking.driverId,
  );
  const assignedBookings = bookings.filter((booking) => booking.driverId);

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {drivers.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          No approved drivers yet. Approve drivers first before assigning bookings.
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Paid bookings waiting for a driver
        </h2>

        {unassignedBookings.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No paid bookings waiting for assignment.
          </p>
        ) : (
          unassignedBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{booking.contactName}</p>
                  <p className="text-sm text-slate-600">{booking.contactPhone}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  {booking.statusLabel}
                </span>
              </div>
              <dl className="mt-4 space-y-1 text-sm text-slate-600">
                <div>
                  <dt className="inline font-medium text-slate-800">Move date: </dt>
                  <dd className="inline">
                    {new Date(booking.scheduledAt).toLocaleDateString("en-KE", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-800">From: </dt>
                  <dd className="inline">{booking.pickupSummary}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-800">To: </dt>
                  <dd className="inline">{booking.dropoffSummary}</dd>
                </div>
                {booking.notes ? (
                  <div>
                    <dt className="inline font-medium text-slate-800">Notes: </dt>
                    <dd className="inline">{booking.notes}</dd>
                  </div>
                ) : null}
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
              </dl>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Assign driver
                  <select
                    value={selectedDrivers[booking.id] ?? ""}
                    onChange={(event) =>
                      setSelectedDrivers((current) => ({
                        ...current,
                        [booking.id]: event.target.value,
                      }))
                    }
                    className="mt-2 block min-w-[220px] rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
                  >
                    <option value="">Select driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.fullName}
                        {driver.plateNumber ? ` (${driver.plateNumber})` : ""}
                        {driver.isAvailable ? " — available" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => handleAssign(booking.id)}
                  disabled={processingId === booking.id || drivers.length === 0}
                  className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {processingId === booking.id ? "Assigning..." : "Assign booking"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Assigned bookings</h2>

        {assignedBookings.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No bookings assigned yet.
          </p>
        ) : (
          assignedBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{booking.contactName}</p>
                  <p className="text-sm text-slate-600">
                    Driver: {booking.driverName ?? "Unknown"}
                  </p>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                  {booking.statusLabel}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {booking.pickupSummary} → {booking.dropoffSummary}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Reassign driver
                  <select
                    value={selectedDrivers[booking.id] ?? booking.driverId ?? ""}
                    onChange={(event) =>
                      setSelectedDrivers((current) => ({
                        ...current,
                        [booking.id]: event.target.value,
                      }))
                    }
                    className="mt-2 block min-w-[220px] rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
                  >
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.fullName}
                        {driver.plateNumber ? ` (${driver.plateNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => handleAssign(booking.id)}
                  disabled={processingId === booking.id}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {processingId === booking.id ? "Updating..." : "Update assignment"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
