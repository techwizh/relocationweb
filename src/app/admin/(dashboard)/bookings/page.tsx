import { BookingAssignmentPanel } from "@/components/admin/booking-assignment-panel";
import { fetchApi } from "@/lib/api-server";

export default async function AdminBookingsPage() {
  const { ok, data } = await fetchApi<{
    bookings: Parameters<typeof BookingAssignmentPanel>[0]["initialBookings"];
    approvedDrivers: Parameters<typeof BookingAssignmentPanel>[0]["initialDrivers"];
  }>("/api/admin/bookings");

  const initialBookings = ok && data ? data.bookings : [];
  const initialDrivers = ok && data ? data.approvedDrivers : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-3 text-slate-600">
        Assign paid customer bookings to approved drivers in your fleet.
      </p>

      <div className="mt-8">
        <BookingAssignmentPanel
          initialBookings={initialBookings}
          initialDrivers={initialDrivers}
        />
      </div>
    </div>
  );
}
