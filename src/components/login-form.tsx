"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomerPageShell } from "@/components/customer-page-shell";
import { MotionFadeUp } from "@/components/motion-section";

type LoginType = "customer" | "driver";

const inputClassName =
  "mt-2 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const nextPath = searchParams.get("next");

  const [loginType, setLoginType] = useState<LoginType>(
    typeParam === "driver" ? "driver" : "customer",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeParam === "driver" || typeParam === "customer") {
      setLoginType(typeParam);
    }
  }, [typeParam]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const endpoint =
      loginType === "driver" ? "/api/driver/login" : "/api/customer/login";
    const defaultRedirect =
      loginType === "driver" ? "/driver/dashboard" : "/account";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      router.push(data.redirectTo ?? nextPath ?? defaultRedirect);
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerPageShell
      eyebrow="Welcome back"
      title="Sign in"
      description={
        loginType === "driver"
          ? "Sign in with your driver registration email and password."
          : "Sign in to view your bookings, chat, and live tracking."
      }
      badges={[
        { icon: loginType === "driver" ? "🚛" : "👤", text: loginType === "driver" ? "Driver portal" : "Customer account" },
        { icon: "🔒", text: "Secure login" },
      ]}
      maxWidth="md"
    >
      <MotionFadeUp delay={250}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLoginType("customer")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              loginType === "customer"
                ? "bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-md"
                : "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setLoginType("driver")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              loginType === "driver"
                ? "bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-md"
                : "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
            }`}
          >
            Driver
          </button>
        </div>
      </MotionFadeUp>

      <MotionFadeUp delay={300}>
        <form
          onSubmit={handleSubmit}
          className="motion-card mt-6 space-y-4 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-lg shadow-teal-900/5"
        >
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className={inputClassName}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </MotionFadeUp>

      <MotionFadeUp delay={350}>
        {loginType === "customer" ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            New customer?{" "}
            <Link href="/register" className="font-medium text-teal-700 hover:underline">
              Create an account
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-500">
            New driver?{" "}
            <Link href="/driver/register" className="font-medium text-teal-700 hover:underline">
              Register here
            </Link>
          </p>
        )}

        <p className="mt-2 text-center text-sm text-slate-500">
          Admin?{" "}
          <Link href="/admin/login" className="font-medium text-teal-700 hover:underline">
            Admin login
          </Link>
        </p>
      </MotionFadeUp>
    </CustomerPageShell>
  );
}
