import Link from "next/link";

export default async function BookingAccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { reason, next } = await searchParams;
  const nextPath = next ?? "/account";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Booking access required</h1>
        <p className="mt-3 text-sm text-amber-800">
          {reason === "payment_required"
            ? "Complete payment for this booking before opening chat or tracking."
            : "Sign in to your account or use the device where you made the booking."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/login?type=customer&next=${encodeURIComponent(nextPath)}`}
            className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Customer sign in
          </Link>
          <Link
            href="/login?type=driver"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Driver sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
