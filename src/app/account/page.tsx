import { AccountBookings } from "@/components/account-bookings";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";
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
    <CustomerPageShell
      eyebrow="Your dashboard"
      title="My account"
      description="Track your moves, open chat, and follow your driver live — all from one place."
      badges={[
        { icon: "🚚", text: `${data.bookings.length} booking${data.bookings.length === 1 ? "" : "s"}` },
        { icon: "💬", text: "Chat & track" },
      ]}
      maxWidth="4xl"
    >
      <MotionFadeUp delay={250}>
        <AccountBookings
          fullName={data.user.fullName}
          email={data.user.email}
          phone={data.user.phone}
          bookings={data.bookings}
        />
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
