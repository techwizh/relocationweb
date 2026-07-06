"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { BookingStatus } from "@prisma/client";
import { isActiveJobStatus } from "@/lib/booking-status";

const LocationMap = dynamic(
  () => import("@/components/location-map").then((module) => module.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
        Loading map...
      </div>
    ),
  },
);

type TrackingPayload = {
  status: BookingStatus;
  statusLabel: string;
  trackingAvailable: boolean;
  driverName?: string;
  pickupSummary?: string;
  dropoffSummary?: string;
  location?: {
    lat: number;
    lng: number;
    updatedAt: string;
  } | null;
  message?: string;
};

type BookingTrackerProps = {
  bookingId: string;
};

export function BookingTracker({ bookingId }: BookingTrackerProps) {
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/location`);
        const payload = (await response.json()) as TrackingPayload & { error?: string };

        if (!response.ok) {
          if (!cancelled) {
            setError(payload.error ?? "Could not load tracking.");
          }
          return;
        }

        if (!cancelled) {
          setData(payload);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load tracking.");
        }
      }
    }

    loadLocation();
    const interval = setInterval(loadLocation, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId]);

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-600">Loading live tracking...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="motion-card rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-lg shadow-teal-900/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 text-lg text-white shadow-md">
            📡
          </span>
          <h3 className="font-semibold text-teal-900">Live status</h3>
        </div>
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-teal-800">Status:</span>{" "}
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">
              {data.statusLabel}
            </span>
          </p>
          {data.driverName ? (
            <p>
              <span className="font-semibold text-teal-800">Driver:</span>{" "}
              {data.driverName}
            </p>
          ) : null}
          {data.pickupSummary ? (
            <p>
              <span className="font-semibold text-teal-800">From:</span>{" "}
              {data.pickupSummary}
            </p>
          ) : null}
          {data.dropoffSummary ? (
            <p>
              <span className="font-semibold text-teal-800">To:</span>{" "}
              {data.dropoffSummary}
            </p>
          ) : null}
        </div>
      </div>

      {!data.trackingAvailable ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {data.message ?? "Tracking is not available yet."}
        </p>
      ) : null}

      {data.trackingAvailable && data.location ? (
        <>
          <LocationMap
            lat={data.location.lat}
            lng={data.location.lng}
            label={data.driverName ?? "Driver"}
          />
          <p className="text-xs text-slate-500">
            Last updated{" "}
            {new Date(data.location.updatedAt).toLocaleTimeString("en-KE")}. Map
            refreshes every 10 seconds.
          </p>
        </>
      ) : null}

      {data.trackingAvailable && !data.location ? (
        <p className="rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-3 text-sm text-slate-600">
          {data.message ?? "Waiting for driver location..."}
        </p>
      ) : null}

      {data.status === "DELIVERED" ? (
        <p className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 text-sm text-teal-800">
          This move has been marked as delivered.
        </p>
      ) : null}
    </div>
  );
}

export function DriverLocationSharing({
  isApproved,
  isAvailable,
  jobs,
}: {
  isApproved: boolean;
  isAvailable: boolean;
  jobs: Array<{ id: string; status: BookingStatus }>;
}) {
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isApproved) {
      return;
    }

    if (!navigator.geolocation) {
      setError("Location sharing is not supported in this browser.");
      return;
    }

    const activeJob = jobs.find((job) => isActiveJobStatus(job.status));

    if (!activeJob && !isAvailable) {
      setStatusMessage("Go available or start a job to share your location.");
      return;
    }

    let cancelled = false;

    async function sendLocation(position: GeolocationPosition) {
      const currentActiveJob = jobs.find((job) => isActiveJobStatus(job.status));
      const mode = currentActiveJob ? "ACTIVE_JOB" : "AVAILABLE";

      try {
        const response = await fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            bookingId: currentActiveJob?.id ?? null,
            mode,
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          if (!cancelled) {
            setError(data.error ?? "Could not share location.");
          }
          return;
        }

        if (!cancelled) {
          setError("");
          setStatusMessage(
            currentActiveJob
              ? "Sharing live location for your active job."
              : "Sharing location while available.",
          );
        }
      } catch {
        if (!cancelled) {
          setError("Could not share location.");
        }
      }
    }

    function handleError() {
      if (!cancelled) {
        setError("Allow location access in your browser to share GPS.");
      }
    }

    navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
      enableHighAccuracy: true,
      maximumAge: 15000,
    });

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
        enableHighAccuracy: true,
        maximumAge: 15000,
      });
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isApproved, isAvailable, jobs]);

  if (!isApproved) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Live location</h2>
      <p className="mt-2 text-sm text-slate-600">
        Your GPS is shared every 60 seconds while you are available or on an
        active job. Customers can track you on their booking page.
      </p>
      {statusMessage ? (
        <p className="mt-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {statusMessage}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
