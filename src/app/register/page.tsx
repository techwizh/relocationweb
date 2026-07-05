import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
      <p className="mt-3 text-slate-600">
        Sign up to track your moves, chat with drivers, and see live tracking in
        one place.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-slate-500">
        Driver?{" "}
        <Link href="/driver/register" className="font-medium text-teal-700 hover:underline">
          Register as a driver
        </Link>
      </p>
    </div>
  );
}
