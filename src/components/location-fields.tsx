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
};

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
}: LocationFieldsProps) {
  const subCounties = getSubCounties(cityId);

  return (
    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-2 text-sm font-semibold text-slate-800">{title}</legend>

      <label className="block text-sm font-medium text-slate-700">
        Sub-county
        <select
          name={`${prefix}SubCounty`}
          value={subCounty}
          onChange={(event) => onSubCountyChange(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
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
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
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
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
    </fieldset>
  );
}
