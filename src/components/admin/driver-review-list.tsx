"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VEHICLE_TYPE_LABELS,
  type DriverReviewRecord,
} from "@/lib/driver-display";

type DriverStatusFilter = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { id: DriverStatusFilter; label: string }[] = [
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

type DriverReviewListProps = {
  initialStatus: DriverStatusFilter;
  initialDrivers: DriverReviewRecord[];
};

export function DriverReviewList({
  initialStatus,
  initialDrivers,
}: DriverReviewListProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [contactPhones, setContactPhones] = useState<Record<string, string>>({});
  const [savingContactId, setSavingContactId] = useState<string | null>(null);

  useEffect(() => {
    setDrivers(initialDrivers);
    setStatus(initialStatus);
    setContactPhones(
      Object.fromEntries(
        initialDrivers.map((driver) => [
          driver.id,
          driver.user.contactPhone ?? "",
        ]),
      ),
    );
  }, [initialDrivers, initialStatus]);

  async function loadDrivers(nextStatus: DriverStatusFilter) {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/drivers?status=${nextStatus}`);
      const data = (await response.json()) as {
        drivers?: DriverReviewRecord[];
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not load drivers.");
        return;
      }

      setDrivers(data.drivers ?? []);
      setStatus(nextStatus);
      router.replace(`/admin/drivers?status=${nextStatus}`, { scroll: false });
    } catch {
      setError("Could not load drivers.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(driverId: string) {
    setProcessingId(driverId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/drivers/${driverId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not approve driver.");
        return;
      }

      setMessage(data.message ?? "Driver approved.");
      await loadDrivers(status);
      router.refresh();
    } catch {
      setError("Could not approve driver.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(driverId: string) {
    if (!rejectionReason.trim()) {
      setError("Enter a rejection reason.");
      return;
    }

    setProcessingId(driverId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/drivers/${driverId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not reject driver.");
        return;
      }

      setMessage(data.message ?? "Driver rejected.");
      setRejectingId(null);
      setRejectionReason("");
      await loadDrivers(status);
      router.refresh();
    } catch {
      setError("Could not reject driver.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSaveContact(driverId: string) {
    setSavingContactId(driverId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/drivers/${driverId}/contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactPhones[driverId] }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not save contact phone.");
        return;
      }

      setMessage(data.message ?? "Contact phone saved.");
      await loadDrivers(status);
      router.refresh();
    } catch {
      setError("Could not save contact phone.");
    } finally {
      setSavingContactId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => loadDrivers(tab.id)}
            disabled={isLoading}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === tab.id
                ? "bg-teal-700 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            } disabled:opacity-60`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading drivers...</p>
      ) : null}

      {!isLoading && drivers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            No {status.toLowerCase()} driver applications.
          </p>
          {status !== "PENDING" ? (
            <button
              type="button"
              onClick={() => loadDrivers("PENDING")}
              className="mt-4 text-sm font-medium text-teal-700 hover:underline"
            >
              View pending applications
            </button>
          ) : (
            <Link
              href="/driver/register"
              className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
            >
              Open driver registration form
            </Link>
          )}
        </div>
      ) : null}

      <div className="space-y-6">
        {drivers.map((driver) => (
          <article
            key={driver.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {driver.user.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{driver.user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Applied {new Date(driver.createdAt).toLocaleString("en-KE")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  driver.status === "APPROVED"
                    ? "bg-teal-100 text-teal-800"
                    : driver.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {driver.status}
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Profile</h3>
                <div className="mt-3 flex flex-wrap gap-4">
                  {driver.profilePhotoUrl ? (
                    <div>
                      <p className="text-xs text-slate-500">Profile photo</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={driver.profilePhotoUrl}
                        alt={`${driver.user.fullName} profile`}
                        className="mt-1 h-32 w-32 rounded-xl border border-slate-200 object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">License:</span>{" "}
                      {driver.licenseNumber}
                    </p>
                    {driver.licensePhotoUrl ? (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500">License photo</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={driver.licensePhotoUrl}
                          alt={`${driver.user.fullName} license`}
                          className="mt-1 h-32 rounded-xl border border-slate-200 object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {driver.vehicle ? (
                <section>
                  <h3 className="text-sm font-semibold text-slate-800">Vehicle</h3>
                  <dl className="mt-3 space-y-1 text-sm text-slate-600">
                    <div>
                      <dt className="inline font-medium text-slate-800">Type: </dt>
                      <dd className="inline">
                        {VEHICLE_TYPE_LABELS[driver.vehicle.type]}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-800">Make/model: </dt>
                      <dd className="inline">
                        {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year})
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-800">Color: </dt>
                      <dd className="inline">{driver.vehicle.color}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-800">Plate: </dt>
                      <dd className="inline">{driver.vehicle.plateNumber}</dd>
                    </div>
                  </dl>
                  {driver.vehicle.photoUrls.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {driver.vehicle.photoUrls.map((url) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={url}
                          src={url}
                          alt={`${driver.vehicle?.plateNumber} vehicle`}
                          className="h-28 w-40 rounded-xl border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            {driver.status === "REJECTED" && driver.rejectionReason ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="font-medium">Rejection reason:</span>{" "}
                {driver.rejectionReason}
              </p>
            ) : null}

            {driver.status === "APPROVED" ? (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-800">
                  Admin contact phone
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Internal driver line for Relocate ops — never shown to customers.
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone number
                    <input
                      type="tel"
                      value={contactPhones[driver.id] ?? ""}
                      onChange={(event) =>
                        setContactPhones((current) => ({
                          ...current,
                          [driver.id]: event.target.value,
                        }))
                      }
                      placeholder="0712345678"
                      className="mt-2 block min-w-[220px] rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSaveContact(driver.id)}
                    disabled={savingContactId === driver.id}
                    className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {savingContactId === driver.id ? "Saving..." : "Save contact"}
                  </button>
                </div>
              </div>
            ) : null}

            {driver.status === "PENDING" ? (
              <div className="mt-6 border-t border-slate-200 pt-6">
                {rejectingId === driver.id ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Rejection reason
                      <textarea
                        value={rejectionReason}
                        onChange={(event) => setRejectionReason(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
                        placeholder="Explain what needs to be corrected..."
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleReject(driver.id)}
                        disabled={processingId === driver.id}
                        className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Confirm reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}
                        className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(driver.id)}
                      disabled={processingId === driver.id}
                      className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                      Approve driver
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(driver.id);
                        setRejectionReason("");
                        setError("");
                      }}
                      disabled={processingId === driver.id}
                      className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
