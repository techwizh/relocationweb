"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";

const inputClassName =
  "mt-2 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

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
      className="motion-card space-y-4 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-lg shadow-teal-900/5"
    >
      <label className="block text-sm font-medium text-slate-700">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Email address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={inputClassName}
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
          className={inputClassName}
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
          className={inputClassName}
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="motion-button w-full rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 hover:from-teal-800 hover:to-cyan-800 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login?type=customer" className="font-medium text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
