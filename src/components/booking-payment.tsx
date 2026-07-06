"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BookingPaymentProps = {
  bookingId: string;
  contactName: string;
  contactPhone: string;
  amount: number;
  vehicleLabel: string;
  pickupSummary: string;
  dropoffSummary: string;
  scheduledAt: string;
  mpesaConfigured: boolean;
  isSandbox?: boolean;
};

type PaymentStatus =
  | "idle"
  | "pushing"
  | "waiting"
  | "completed"
  | "failed"
  | "config_error";

export function BookingPayment({
  bookingId,
  contactName,
  contactPhone,
  amount,
  vehicleLabel,
  pickupSummary,
  dropoffSummary,
  scheduledAt,
  mpesaConfigured,
  isSandbox = false,
}: BookingPaymentProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>(
    mpesaConfigured ? "idle" : "config_error",
  );
  const [message, setMessage] = useState(
    mpesaConfigured
      ? "Tap the button below to receive an M-Pesa prompt on your phone."
      : "M-Pesa credentials are missing from .env. Add your Daraja sandbox keys to test payments.",
  );

  async function readJsonResponse(response: Response) {
    const text = await response.text();
    try {
      return JSON.parse(text) as {
        status?: string;
        message?: string;
        error?: string;
        receipt?: string;
      };
    } catch {
      throw new Error("Server returned an invalid response. Check that npm run dev is running.");
    }
  }

  async function applyStatusData(data: {
    status?: string;
    message?: string;
    receipt?: string;
  }) {
    if (data.status === "COMPLETED") {
      setStatus("completed");
      setMessage(
        data.receipt
          ? `Payment received. M-Pesa receipt: ${data.receipt}`
          : "Payment received successfully.",
      );
      return true;
    }

    if (data.status === "PENDING") {
      setStatus("waiting");
      setMessage(
        data.message ??
          (isSandbox
            ? "Waiting for sandbox payment confirmation..."
            : "Check your phone and enter your M-Pesa PIN to complete payment."),
      );
      return true;
    }

    if (data.status === "FAILED") {
      setStatus("failed");
      setMessage(data.message ?? "Payment was cancelled or failed.");
      return true;
    }

    return false;
  }

  async function checkPaymentStatus() {
    const response = await fetch(`/api/bookings/${bookingId}/payment-status`);
    const data = await readJsonResponse(response);
    return applyStatusData(data);
  }

  useEffect(() => {
    if (!mpesaConfigured) return;

    checkPaymentStatus().catch(() => {
      // Ignore initial status load errors.
    });
  }, [bookingId, mpesaConfigured]);

  useEffect(() => {
    if (status !== "waiting") return;

    const interval = setInterval(async () => {
      try {
        await checkPaymentStatus();
      } catch {
        // Keep polling through temporary M-Pesa/network errors.
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId, status]);

  async function handlePay() {
    setStatus("pushing");
    setMessage("Sending M-Pesa prompt to your phone...");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: "POST",
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setStatus(response.status === 503 ? "config_error" : "failed");
        setMessage(
          data.error ??
            "Could not start M-Pesa payment. Wait 30 seconds before retrying.",
        );
        return;
      }

      await applyStatusData(data);
    } catch {
      setStatus("failed");
      setMessage("Network error while starting payment.");
    }
  }

  async function handleRetry() {
    setMessage("Checking payment status...");
    try {
      const resolved = await checkPaymentStatus();
      if (!resolved) {
        await handlePay();
      }
    } catch (error) {
      setStatus("failed");
      setMessage(error instanceof Error ? error.message : "Could not check payment status.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="motion-card rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-lg shadow-teal-900/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-lg shadow-md">
            📋
          </span>
          <h2 className="text-lg font-semibold text-teal-900">Booking summary</h2>
        </div>
        <dl className="mt-4 space-y-3 text-sm text-slate-600">
          <div>
            <dt className="font-medium text-slate-800">Customer</dt>
            <dd>{contactName}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">Phone</dt>
            <dd>{contactPhone}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">Vehicle</dt>
            <dd>{vehicleLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">Move date</dt>
            <dd>{scheduledAt}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">From</dt>
            <dd>{pickupSummary}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">To</dt>
            <dd>{dropoffSummary}</dd>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-3">
            <dt className="font-medium text-teal-900">Amount due</dt>
            <dd className="text-2xl font-bold text-teal-800">
              KES {amount.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          status === "completed"
            ? "border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-900"
            : status === "failed" || status === "config_error"
              ? "border-red-200 bg-red-50 text-red-700"
              : status === "waiting"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-teal-100 bg-teal-50/50 text-slate-700"
        }`}
      >
        {message}
      </div>

      {status === "completed" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push(`/book/${bookingId}/chat`)}
            className="motion-button rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-800 hover:to-cyan-800"
          >
            Continue to chat →
          </button>
          <Link
            href="/book"
            className="rounded-full border border-teal-200 bg-white px-6 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-50"
          >
            Book another move
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePay}
            disabled={status === "pushing" || status === "waiting" || status === "config_error"}
            className="motion-button rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-800 hover:to-cyan-800 disabled:opacity-60"
          >
            {status === "pushing"
              ? "Sending prompt..."
              : status === "waiting"
                ? "Waiting for PIN..."
                : "Pay with M-Pesa"}
          </button>
          {(status === "failed" || status === "waiting") && (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {status === "waiting" ? "Check payment status" : "Retry payment"}
            </button>
          )}
        </div>
      )}

      {isSandbox ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Sandbox testing</p>
          <p className="mt-1">
            Use phone <strong>254708374149</strong> on the booking form. This page
            should show &quot;Payment received&quot; after Safaricom confirms. Keep
            localtunnel running and match <code>MPESA_CALLBACK_URL</code> in{" "}
            <code>.env</code>. If you see HTTP 403, wait 60 seconds before retrying.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-medium">Live M-Pesa payment</p>
          <p className="mt-1">
            Tap Pay below. An M-Pesa prompt will appear on{" "}
            <strong>{contactPhone}</strong>. Enter your M-Pesa PIN on your phone to
            confirm. Real money will be charged.
          </p>
        </div>
      )}

      {status === "config_error" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Daraja sandbox setup</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Create an app at developer.safaricom.co.ke</li>
            <li>Copy Consumer Key, Consumer Secret, Passkey, and Shortcode</li>
            <li>Set MPESA_CALLBACK_URL to a public HTTPS URL + /api/mpesa/callback</li>
            <li>For local testing, use ngrok and paste the ngrok URL in .env</li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
