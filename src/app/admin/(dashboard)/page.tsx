import Link from "next/link";
import { fetchApi } from "@/lib/api-server";

export default async function AdminDashboardPage() {
  const { ok, data } = await fetchApi<{
    pendingDrivers: number;
    todaysBookings: number;
    liveVehicles: number;
  }>("/api/admin/stats");

  const pendingDrivers = ok && data ? data.pendingDrivers : 0;
  const todaysBookings = ok && data ? data.todaysBookings : 0;
  const liveVehicles = ok && data ? data.liveVehicles : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
      <p className="mt-3 text-slate-600">
        Manage your website content, review drivers, and monitor bookings.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/content"
          className="rounded-2xl border border-teal-200 bg-teal-50 p-6 shadow-sm transition hover:border-teal-300"
        >
          <h2 className="text-lg font-semibold text-teal-900">Edit landing page</h2>
          <p className="mt-2 text-sm text-teal-800">
            Update hero text, upload photos, and customize sections shown on the
            home page.
          </p>
        </Link>

        <Link
          href="/admin/drivers"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200"
        >
          <h2 className="text-lg font-semibold text-slate-900">Review drivers</h2>
          <p className="mt-2 text-sm text-slate-600">
            Approve or reject driver applications, including profile and vehicle
            photos.
          </p>
          {pendingDrivers > 0 ? (
            <p className="mt-3 text-sm font-semibold text-amber-700">
              {pendingDrivers} pending application{pendingDrivers === 1 ? "" : "s"}
            </p>
          ) : null}
        </Link>

        <Link
          href="/admin/bookings"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200"
        >
          <h2 className="text-lg font-semibold text-slate-900">Assign bookings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Match paid customer bookings to approved drivers in your fleet.
          </p>
        </Link>

        <Link
          href="/admin/fleet"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200"
        >
          <h2 className="text-lg font-semibold text-slate-900">Fleet tracking</h2>
          <p className="mt-2 text-sm text-slate-600">
            Live map of approved drivers sharing GPS from the driver portal.
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Pending drivers",
            value: String(pendingDrivers),
            note: "Review profile and vehicle photos",
            href: "/admin/drivers?status=PENDING",
          },
          {
            title: "Today’s bookings",
            value: String(todaysBookings),
            note: "Assign drivers in Mombasa",
            href: "/admin/bookings",
          },
          {
            title: "Live vehicles",
            value: String(liveVehicles),
            note: "Approved drivers currently available",
            href: "/admin/fleet",
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200"
          >
            <h2 className="text-sm font-medium text-slate-500">{card.title}</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
