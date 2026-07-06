"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocationFields } from "@/components/location-fields";
import type { CityId } from "@/lib/locations";
import { CITIES } from "@/lib/locations";
import { isValidKenyanPhone, normalizeKenyanPhone } from "@/lib/phone";
import type { VehicleTypeId } from "@/lib/vehicles";
import { VEHICLE_OPTIONS } from "@/lib/vehicles";

const inputClassName =
  "mt-2 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

export function BookingForm({
  skipPayment = false,
  isSandbox = true,
  initialContactName = "",
  initialContactPhone = "",
  initialVehicleType,
}: {
  skipPayment?: boolean;
  isSandbox?: boolean;
  initialContactName?: string;
  initialContactPhone?: string;
  initialVehicleType?: VehicleTypeId;
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
  const [vehicleType, setVehicleType] = useState<VehicleTypeId>(
    initialVehicleType ?? VEHICLE_OPTIONS[0].id,
  );
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
      className="motion-card space-y-8 overflow-hidden rounded-3xl border border-teal-100 bg-white p-6 shadow-lg shadow-teal-900/5 sm:p-8"
    >
      <FormStep number={1} title="Your details" icon="👤">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
              className={inputClassName}
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
              className={inputClassName}
            />
          </label>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          We use your phone for booking updates and M-Pesa payment. Drivers cannot see
          your number in chat.
          {!skipPayment && isSandbox ? (
            <> Sandbox test: <strong>254708374149</strong>.</>
          ) : null}
        </p>
      </FormStep>

      <FormStep number={2} title="Locations" icon="📍">
        <label className="block text-sm font-medium text-slate-700">
          City
          <select
            value={cityId}
            onChange={(event) => handleCityChange(event.target.value as CityId)}
            className={inputClassName}
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
          variant="pickup"
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
          variant="dropoff"
          subCounty={dropoffSubCounty}
          ward={dropoffWard}
          landmark={dropoffLandmark}
          onSubCountyChange={setDropoffSubCounty}
          onWardChange={setDropoffWard}
          onLandmarkChange={setDropoffLandmark}
        />
      </FormStep>

      <FormStep number={3} title="Vehicle & date" icon="🚚">
        <label className="block text-sm font-medium text-slate-700">
          Move date
          <input
            type="date"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            required
            className={inputClassName}
          />
        </label>

        <div>
          <p className="text-sm font-medium text-slate-700">Choose your vehicle</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {VEHICLE_OPTIONS.map((vehicle) => {
              const selected = vehicleType === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setVehicleType(vehicle.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    selected
                      ? `border-transparent bg-gradient-to-br ${vehicle.theme.gradient} text-white shadow-md`
                      : "border-teal-100 bg-teal-50/50 hover:border-teal-300"
                  }`}
                >
                  <span className="text-2xl">{vehicle.theme.emoji}</span>
                  <p className={`mt-2 font-semibold ${selected ? "text-white" : "text-slate-900"}`}>
                    {vehicle.name}
                  </p>
                  <p className={`mt-1 text-sm ${selected ? "text-white/90" : "text-teal-700"}`}>
                    From KES {vehicle.basePriceKes.toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </FormStep>

      <FormStep number={4} title="Extra notes" icon="📝">
        <label className="block text-sm font-medium text-slate-700">
          Special instructions (optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Large items, floor number, parking details, etc."
            className={inputClassName}
          />
        </label>
      </FormStep>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="motion-button w-full rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 hover:from-teal-800 hover:to-cyan-800 disabled:opacity-60"
      >
        {isSubmitting
          ? "Saving your booking..."
          : skipPayment
            ? "Confirm booking →"
            : "Continue to M-Pesa payment →"}
      </button>
    </form>
  );
}

function FormStep({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-sm font-bold text-white shadow-md">
          {number}
        </span>
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold text-teal-900">
            <span aria-hidden>{icon}</span>
            {title}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
