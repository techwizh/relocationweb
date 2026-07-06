import Link from "next/link";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <CustomerPageShell
      eyebrow="Get started"
      title="Create account"
      description="Sign up to track your moves, chat with drivers, and see live tracking in one place."
      badges={[
        { icon: "📱", text: "Track bookings" },
        { icon: "💬", text: "Driver chat" },
        { icon: "📡", text: "Live GPS" },
      ]}
      maxWidth="md"
    >
      <MotionFadeUp delay={250}>
        <RegisterForm />
      </MotionFadeUp>
      <MotionFadeUp delay={300}>
        <p className="mt-6 text-center text-sm text-slate-500">
          Driver?{" "}
          <Link href="/driver/register" className="font-medium text-teal-700 hover:underline">
            Register as a driver
          </Link>
        </p>
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
