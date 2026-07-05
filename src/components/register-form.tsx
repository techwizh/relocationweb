"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidKenyanPhone(phone)) {
      setError("Enter a valid Kenyan phone number (e.g. 0712345678).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: normalizeKenyanPhone(phone),
          password,
        }),
      });

      const data = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      router.push(data.redirectTo ?? "/account");
      router.refresh();
    } catch {
      setError("Could not create account. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block text-sm font-medium text-slate-700">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Email address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Phone number
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="0712345678"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <p className="text-xs text-slate-500">
        Past bookings made with this phone number will appear in your account
        automatically.
      </p>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login?type=customer" className="font-medium text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
