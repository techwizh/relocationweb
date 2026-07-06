import { DriverRegisterForm } from "@/components/driver-register-form";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";

export default function DriverRegisterPage() {
  return (
    <CustomerPageShell
      eyebrow="Join our fleet"
      title="Driver registration"
      description="Upload your profile photo and vehicle photos for admin approval. Relocate manages contact details and keeps customer communication inside the app."
      heroImageSrc="/images/driver-register-vehicle.png"
      heroImageAlt="Relocation vehicles ready for moving jobs"
      badges={[
        { icon: "🚛", text: "Earn on your schedule" },
        { icon: "✅", text: "Admin verified" },
        { icon: "💬", text: "In-app chat only" },
      ]}
      maxWidth="3xl"
    >
      <MotionFadeUp delay={250}>
        <DriverRegisterForm />
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
