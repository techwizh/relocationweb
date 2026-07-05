import { DriverRegisterForm } from "@/components/driver-register-form";

export default function DriverRegisterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Driver registration</h1>
      <p className="mt-3 text-slate-600">
        Upload your profile photo and vehicle photos for admin approval. Phone
        numbers are not collected from drivers — Relocate manages contact details
        and keeps customer communication inside the app.
      </p>

      <DriverRegisterForm />
    </div>
  );
}
