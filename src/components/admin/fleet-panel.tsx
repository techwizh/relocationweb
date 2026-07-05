"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { FleetDriverMarker } from "@/components/fleet-map";

const FleetMap = dynamic(
  () => import("@/components/fleet-map").then((module) => module.FleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[28rem] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
        Loading fleet map...
      </div>
    ),
  },
);

type FleetDriverRecord = {
  id: string;
  fullName: string;
  isAvailable: boolean;
  onActiveJob: boolean;
  vehicleLabel: string | null;
  location: {
    lat: number;
    lng: number;
    mode: string;
    updatedAt: string;
  } | null;
};

export function AdminFleetPanel() {
  const [drivers, setDrivers] = useState<FleetDriverRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFleet() {
      try {
        const response = await fetch("/api/admin/fleet");
        const data = (await response.json()) as {
          drivers?: FleetDriverRecord[];
          error?: string;
        };

        if (!response.ok) {
          if (!cancelled) {
            setError(data.error ?? "Could not load fleet.");
          }
          return;
        }

        if (!cancelled) {
          setDrivers(data.drivers ?? []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load fleet.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFleet();
    const interval = setInterval(loadFleet, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const mappedDrivers: FleetDriverMarker[] = drivers
    .filter((driver): driver is FleetDriverRecord & { location: NonNullable<FleetDriverRecord["location"]> } =>
      Boolean(driver.location),
    )
    .map((driver) => ({
      id: driver.id,
      fullName: driver.fullName,
      isAvailable: driver.isAvailable,
      onActiveJob: driver.onActiveJob,
      vehicleLabel: driver.vehicleLabel,
      lat: driver.location.lat,
      lng: driver.location.lng,
    }));

  const availableCount = drivers.filter((driver) => driver.isAvailable).length;
  const onJobCount = drivers.filter((driver) => driver.onActiveJob).length;
  const trackedCount = mappedDrivers.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Approved drivers", value: drivers.length },
          { label: "Available now", value: availableCount },
          { label: "On active jobs", value: onJobCount },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          </article>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading fleet data...</p>
      ) : null}

      {!isLoading && trackedCount === 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No driver locations yet. Approved drivers share GPS when they go
          available or start a job from their portal.
        </p>
      ) : null}

      {!isLoading && trackedCount > 0 ? (
        <>
          <FleetMap drivers={mappedDrivers} />
          <p className="text-xs text-slate-500">
            Showing {trackedCount} driver{trackedCount === 1 ? "" : "s"} with GPS
            data. Map refreshes every 15 seconds. Red markers are on active jobs.
          </p>
        </>
      ) : null}

      {!isLoading && drivers.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Driver list</h2>
          <ul className="mt-4 space-y-3">
            {drivers.map((driver) => (
              <li
                key={driver.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{driver.fullName}</p>
                  <p className="text-slate-600">{driver.vehicleLabel ?? "No vehicle"}</p>
                </div>
                <div className="text-right text-slate-600">
                  <p>
                    {driver.onActiveJob
                      ? "On active job"
                      : driver.isAvailable
                        ? "Available"
                        : "Offline"}
                  </p>
                  <p className="text-xs">
                    {driver.location
                      ? `Updated ${new Date(driver.location.updatedAt).toLocaleTimeString("en-KE")}`
                      : "No GPS yet"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
