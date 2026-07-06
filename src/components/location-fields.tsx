"use client";

import type { CityId } from "@/lib/locations";
import { getSubCounties } from "@/lib/locations";

type LocationFieldsProps = {
  cityId: CityId;
  prefix: "pickup" | "dropoff";
  subCounty: string;
  ward: string;
  landmark: string;
  onSubCountyChange: (value: string) => void;
  onWardChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  title: string;
  variant?: "pickup" | "dropoff";
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

export function LocationFields({
  cityId,
  prefix,
  subCounty,
  ward,
  landmark,
  onSubCountyChange,
  onWardChange,
  onLandmarkChange,
  title,
  variant = prefix,
}: LocationFieldsProps) {
  const subCounties = getSubCounties(cityId);
  const borderClass =
    variant === "pickup"
      ? "border-teal-200 bg-teal-50/30"
      : "border-cyan-200 bg-cyan-50/30";
  const legendClass = variant === "pickup" ? "text-teal-900" : "text-cyan-900";

  return (
    <fieldset className={`space-y-4 rounded-2xl border p-4 ${borderClass}`}>
      <legend className={`px-2 text-sm font-semibold ${legendClass}`}>{title}</legend>

      <label className="block text-sm font-medium text-slate-700">
        Sub-county
        <select
          name={`${prefix}SubCounty`}
          value={subCounty}
          onChange={(event) => onSubCountyChange(event.target.value)}
          required
          className={inputClassName}
        >
          <option value="">Select sub-county</option>
          {subCounties.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Ward
        <input
          type="text"
          name={`${prefix}Ward`}
          value={ward}
          onChange={(event) => onWardChange(event.target.value)}
          placeholder="e.g. Kongowea, Bamburi, or your ward name"
          required
          className={inputClassName}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Street / landmark (optional)
        <input
          type="text"
          name={`${prefix}Landmark`}
          value={landmark}
          onChange={(event) => onLandmarkChange(event.target.value)}
          placeholder="Building, estate, or nearby landmark"
          className={inputClassName}
        />
      </label>
    </fieldset>
  );
}
