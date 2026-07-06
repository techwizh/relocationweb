import Link from "next/link";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";

export default async function BookingAccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { reason, next } = await searchParams;
  const nextPath = next ?? "/account";

  return (
    <CustomerPageShell
      eyebrow="Access required"
      title="Booking access required"
      description={
        reason === "payment_required"
          ? "Complete payment for this booking before opening chat or tracking."
          : "Sign in to your account or use the device where you made the booking."
      }
      badges={[
        { icon: "🔐", text: "Sign in needed" },
        { icon: "💳", text: reason === "payment_required" ? "Payment pending" : "Account access" },
      ]}
      maxWidth="lg"
    >
      <MotionFadeUp delay={250}>
        <div className="motion-card rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-8 shadow-lg shadow-amber-900/5">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/login?type=customer&next=${encodeURIComponent(nextPath)}`}
              className="motion-button rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-teal-800 hover:to-cyan-800"
            >
              Customer sign in
            </Link>
            <Link
              href="/login?type=driver"
              className="rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
            >
              Driver sign in
            </Link>
          </div>
        </div>
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
