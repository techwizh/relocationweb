"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VehicleTypeId } from "@/lib/vehicles";
import { VEHICLE_OPTIONS } from "@/lib/vehicles";

export function DriverRegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleTypeId>(VEHICLE_OPTIONS[0].id);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!profilePhoto) {
      setError("Profile photo is required.");
      return;
    }

    if (!licensePhoto) {
      setError("Driving license photo is required.");
      return;
    }

    if (!vehiclePhotos || vehiclePhotos.length === 0) {
      setError("Upload at least one vehicle photo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("licenseNumber", licenseNumber);
      formData.append("vehicleType", vehicleType);
      formData.append("make", make);
      formData.append("model", model);
      formData.append("year", year);
      formData.append("color", color);
      formData.append("plateNumber", plateNumber);
      formData.append("profilePhoto", profilePhoto);
      formData.append("licensePhoto", licensePhoto);

      for (const file of Array.from(vehiclePhotos)) {
        formData.append("vehiclePhotos", file);
      }

      const response = await fetch("/api/drivers/register", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not submit registration. Try again.");
        return;
      }

      router.push("/driver/register/success");
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
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Drivers do not enter a phone number here. Relocate admin assigns and
        manages driver contact details. Customers never see your number — all
        communication stays in the in-app chat.
      </div>

      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-800">
          Account details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Profile photo
          <input
            type="file"
            accept="image/*"
            required
            onChange={(event) => setProfilePhoto(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-slate-600"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-800">
          Driving license
        </legend>
        <label className="block text-sm font-medium text-slate-700">
          License number
          <input
            type="text"
            value={licenseNumber}
            onChange={(event) => setLicenseNumber(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          License photo
          <input
            type="file"
            accept="image/*"
            required
            onChange={(event) => setLicensePhoto(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-slate-600"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-800">
          Vehicle details
        </legend>
        <label className="block text-sm font-medium text-slate-700">
          Vehicle type
          <select
            value={vehicleType}
            onChange={(event) => setVehicleType(event.target.value as VehicleTypeId)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
          >
            {VEHICLE_OPTIONS.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Make
            <input
              type="text"
              value={make}
              onChange={(event) => setMake(event.target.value)}
              required
              placeholder="e.g. Toyota"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Model
            <input
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              required
              placeholder="e.g. Hilux"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Year
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              required
              min={1990}
              max={new Date().getFullYear() + 1}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Color
            <input
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              required
              placeholder="e.g. White"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Plate number
          <input
            type="text"
            value={plateNumber}
            onChange={(event) => setPlateNumber(event.target.value)}
            required
            placeholder="e.g. KAA 123A"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-teal-700 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Vehicle photos (front, side, rear — up to 5)
          <input
            type="file"
            accept="image/*"
            multiple
            required
            onChange={(event) => setVehiclePhotos(event.target.files)}
            className="mt-2 block w-full text-sm text-slate-600"
          />
        </label>
      </fieldset>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit for approval"}
      </button>
    </form>
  );
}
