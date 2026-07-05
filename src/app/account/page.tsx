import { AccountBookings } from "@/components/account-bookings";
import { fetchApi } from "@/lib/api-server";

export default async function AccountPage() {
  const { ok, data } = await fetchApi<{
    user: {
      fullName: string;
      email: string;
      phone: string | null;
    };
    bookings: Parameters<typeof AccountBookings>[0]["bookings"];
  }>("/api/customer/bookings");

  if (!ok || !data) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">My account</h1>
      <p className="mt-3 text-slate-600">
        Track your moves, open chat, and follow your driver live.
      </p>

      <div className="mt-8">
        <AccountBookings
          fullName={data.user.fullName}
          email={data.user.email}
          phone={data.user.phone}
          bookings={data.bookings}
        />
      </div>
    </div>
  );
}
