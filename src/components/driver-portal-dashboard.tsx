"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DriverLocationSharing } from "@/components/booking-tracker";
import {
  BOOKING_STATUS_LABELS,
  type DriverJobRecord,
} from "@/lib/booking-display";
import {
  getNextBookingStatus,
  getStatusActionLabel,
} from "@/lib/booking-status";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import type { BookingStatus, VehicleType } from "@prisma/client";

type DriverPortalDashboardProps = {
  fullName: string;
  email: string;
  driverStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  isAvailable: boolean;
  vehicle: {
    type: VehicleType;
    make: string;
    model: string;
    plateNumber: string;
  } | null;
  jobs: DriverJobRecord[];
};

export function DriverPortalDashboard({
  fullName,
  email,
  driverStatus,
  rejectionReason,
  isAvailable,
  vehicle,
  jobs,
}: DriverPortalDashboardProps) {
  const router = useRouter();
  const [available, setAvailable] = useState(isAvailable);
  const [jobList, setJobList] = useState(jobs);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setJobList(jobs);
    setAvailable(isAvailable);
  }, [jobs, isAvailable]);

  async function handleLogout() {
    await fetch("/api/driver/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleAvailabilityToggle() {
    setIsUpdatingAvailability(true);
    setError("");
    setMessage("");

    const nextValue = !available;

    try {
      const response = await fetch("/api/driver/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextValue }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not update availability.");
        return;
      }

      setAvailable(nextValue);
      setMessage(data.message ?? "Availability updated.");
      router.refresh();
    } catch {
      setError("Could not update availability.");
    } finally {
      setIsUpdatingAvailability(false);
    }
  }

  async function handleStatusUpdate(bookingId: string, nextStatus: BookingStatus) {
    setProcessingJobId(bookingId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/driver/jobs/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        status?: BookingStatus;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not update job status.");
        return;
      }

      setJobList((current) =>
        current.map((job) =>
          job.id === bookingId && data.status
            ? { ...job, status: data.status }
            : job,
        ),
      );
      setMessage(data.message ?? "Job status updated.");
      router.refresh();
    } catch {
      setError("Could not update job status.");
    } finally {
      setProcessingJobId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
          <p className="text-sm text-slate-600">{email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>

      {driverStatus === "PENDING" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Application under review</h2>
          <p className="mt-2 text-sm text-amber-800">
            Your profile is pending admin approval. You will be able to go
            available and receive jobs once approved.
          </p>
        </div>
      ) : null}

      {driverStatus === "REJECTED" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">Application rejected</h2>
          <p className="mt-2 text-sm text-red-700">
            {rejectionReason ?? "Contact Relocate admin for more details."}
          </p>
        </div>
      ) : null}

      {driverStatus === "APPROVED" ? (
        <>
          {vehicle ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Your vehicle</h2>
              <p className="mt-2 text-sm text-slate-600">
                {VEHICLE_TYPE_LABELS[vehicle.type]} — {vehicle.make} {vehicle.model} (
                {vehicle.plateNumber})
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
            <p className="mt-2 text-sm text-slate-600">
              When available, admin can see you as ready for fleet tracking and
              new assignments.
            </p>
            {message ? (
              <p className="mt-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleAvailabilityToggle}
              disabled={isUpdatingAvailability}
              className={`mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                available ? "bg-slate-700 hover:bg-slate-800" : "bg-teal-700 hover:bg-teal-800"
              }`}
            >
              {isUpdatingAvailability
                ? "Updating..."
                : available
                  ? "Go offline"
                  : "Go available"}
            </button>
          </section>

          <DriverLocationSharing
            isApproved
            isAvailable={available}
            jobs={jobList.map((job) => ({ id: job.id, status: job.status }))}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Assigned jobs</h2>
            <p className="mt-2 text-sm text-slate-600">
              Update move status as you progress. Open chat to coordinate with the
              customer.
            </p>

            {jobList.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No jobs assigned yet. Stay available and admin will assign paid
                bookings to you.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {jobList.map((job) => {
                  const nextStatus = getNextBookingStatus(job.status);
                  const actionLabel = getStatusActionLabel(job.status);

                  return (
                    <li
                      key={job.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{job.contactName}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {new Date(job.scheduledAt).toLocaleDateString("en-KE", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                          {BOOKING_STATUS_LABELS[job.status]}
                        </span>
                      </div>
                      <dl className="mt-3 space-y-1 text-sm text-slate-600">
                        <div>
                          <dt className="inline font-medium text-slate-800">From: </dt>
                          <dd className="inline">{job.pickupSummary}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-slate-800">To: </dt>
                          <dd className="inline">{job.dropoffSummary}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-slate-800">Vehicle: </dt>
                          <dd className="inline">{job.vehicleLabel}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-slate-800">Amount: </dt>
                          <dd className="inline">
                            KES {job.estimatedPrice.toLocaleString()}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {nextStatus && actionLabel ? (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(job.id, nextStatus)}
                            disabled={processingJobId === job.id}
                            className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                          >
                            {processingJobId === job.id ? "Updating..." : actionLabel}
                          </button>
                        ) : null}
                        <Link
                          href={`/book/${job.id}/chat`}
                          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Open chat
                        </Link>
                        {job.status !== "DELIVERED" ? (
                          <Link
                            href={`/book/${job.id}/track`}
                            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Preview tracking
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Contact policy</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your phone number is never shown to customers. Chat blocks phone numbers
          and WhatsApp links on both sides.
        </p>
      </section>
    </div>
  );
}
