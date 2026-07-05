"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold text-teal-800">
            Admin
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href="/admin" className="hover:text-teal-700">
              Dashboard
            </Link>
            <Link href="/admin/drivers" className="hover:text-teal-700">
              Drivers
            </Link>
            <Link href="/admin/bookings" className="hover:text-teal-700">
              Bookings
            </Link>
            <Link href="/admin/fleet" className="hover:text-teal-700">
              Fleet
            </Link>
            <Link href="/admin/content" className="hover:text-teal-700">
              Edit landing page
            </Link>
            <Link href="/" className="hover:text-teal-700">
              View site
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
