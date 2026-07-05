"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocationFields } from "@/components/location-fields";
import type { CityId } from "@/lib/locations";
import { CITIES } from "@/lib/locations";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";
import type { VehicleTypeId } from "@/lib/vehicles";
import { VEHICLE_OPTIONS } from "@/lib/vehicles";

export function BookingForm({
  skipPayment = false,
  isSandbox = true,
  initialContactName = "",
  initialContactPhone = "",
}: {
  skipPayment?: boolean;
  isSandbox?: boolean;
  initialContactName?: string;
  initialContactPhone?: string;
}) {
  const router = useRouter();
  const [cityId, setCityId] = useState<CityId>("mombasa");
  const [contactName, setContactName] = useState(initialContactName);
  const [contactPhone, setContactPhone] = useState(initialContactPhone);
  const [pickupSubCounty, setPickupSubCounty] = useState("");
  const [pickupWard, setPickupWard] = useState("");
  const [pickupLandmark, setPickupLandmark] = useState("");
  const [dropoffSubCounty, setDropoffSubCounty] = useState("");
  const [dropoffWard, setDropoffWard] = useState("");
  const [dropoffLandmark, setDropoffLandmark] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [vehicleType, setVehicleType] = useState(VEHICLE_OPTIONS[0].id);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCityChange(nextCityId: CityId) {
    setCityId(nextCityId);
    setPickupSubCounty("");
    setDropoffSubCounty("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidKenyanPhone(contactPhone)) {
      setError("Enter a valid Kenyan phone number (e.g. 0712345678).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId,
          contactName,
          contactPhone: normalizeKenyanPhone(contactPhone),
          pickupSubCounty,
          pickupWard,
          pickupLandmark,
          dropoffSubCounty,
          dropoffWard,
          dropoffLandmark,
          scheduledAt,
          vehicleType,
          notes,
        }),
      });

      const data = (await response.json()) as {
        bookingId?: string;
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok || !data.bookingId) {
        setError(data.error ?? "Could not create booking. Try again.");
        return;
      }

      router.push(data.redirectTo ?? `/book/${data.bookingId}/pay`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
        <legend className="px-2 text-sm font-semibold text-teal-900">
          Your contact details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone number
            <input
              type="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="0712345678"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          We use your phone for booking updates and M-Pesa payment. Drivers cannot
          see your number in chat — communication stays on Relocate.
          {!skipPayment && isSandbox ? (
            <>
              {" "}
              Sandbox test number: <strong>254708374149</strong>.
            </>
          ) : null}
          {!skipPayment && !isSandbox ? (
            <> Use your Safaricom M-Pesa number.</>
          ) : null}
        </p>
      </fieldset>

      <label className="block text-sm font-medium text-slate-700">
        City
        <select
          value={cityId}
          onChange={(event) => handleCityChange(event.target.value as CityId)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        >
          {CITIES.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <LocationFields
        cityId={cityId}
        prefix="pickup"
        title="Moving from"
        subCounty={pickupSubCounty}
        ward={pickupWard}
        landmark={pickupLandmark}
        onSubCountyChange={setPickupSubCounty}
        onWardChange={setPickupWard}
        onLandmarkChange={setPickupLandmark}
      />

      <LocationFields
        cityId={cityId}
        prefix="dropoff"
        title="Moving to"
        subCounty={dropoffSubCounty}
        ward={dropoffWard}
        landmark={dropoffLandmark}
        onSubCountyChange={setDropoffSubCounty}
        onWardChange={setDropoffWard}
        onLandmarkChange={setDropoffLandmark}
      />

      <label className="block text-sm font-medium text-slate-700">
        Move date
        <input
          type="date"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Vehicle type
        <select
          value={vehicleType}
          onChange={(event) =>
            setVehicleType(event.target.value as VehicleTypeId)
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        >
          {VEHICLE_OPTIONS.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name} — from KES {vehicle.basePriceKes.toLocaleString()}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Special instructions (optional)
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Large items, floor number, parking details, etc."
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
        {isSubmitting
          ? "Saving..."
          : skipPayment
            ? "Confirm booking"
            : "Continue to M-Pesa payment"}
      </button>
    </form>
  );
}
