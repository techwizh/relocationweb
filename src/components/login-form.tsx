"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LoginType = "customer" | "driver";

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
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-3 text-slate-600">
        {loginType === "driver"
          ? "Sign in with your driver registration email and password."
          : "Sign in to view your bookings, chat, and live tracking."}
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setLoginType("customer")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            loginType === "customer"
              ? "bg-teal-700 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setLoginType("driver")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            loginType === "driver"
              ? "bg-teal-700 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Driver
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {loginType === "customer" ? (
        <p className="mt-6 text-sm text-slate-500">
          New customer?{" "}
          <Link href="/register" className="font-medium text-teal-700 hover:underline">
            Create an account
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          New driver?{" "}
          <Link href="/driver/register" className="font-medium text-teal-700 hover:underline">
            Register here
          </Link>
        </p>
      )}

      <p className="mt-2 text-sm text-slate-500">
        Admin?{" "}
        <Link href="/admin/login" className="font-medium text-teal-700 hover:underline">
          Admin login
        </Link>
      </p>
    </div>
  );
}
