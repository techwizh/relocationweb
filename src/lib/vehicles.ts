export type VehicleTypeId = "van" | "pickup" | "canter" | "lorry";

export type VehicleTheme = {
  emoji: string;
  gradient: string;
  accent: string;
  accentSoft: string;
  ring: string;
};

export type VehicleOption = {
  id: VehicleTypeId;
  name: string;
  capacity: string;
  bestFor: string;
  exampleLoad: string;
  basePriceKes: number;
  theme: VehicleTheme;
};

export const VEHICLE_THEMES: Record<VehicleTypeId, VehicleTheme> = {
  van: {
    emoji: "🚐",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    accent: "text-sky-700",
    accentSoft: "bg-sky-50 text-sky-800",
    ring: "ring-sky-200",
  },
  pickup: {
    emoji: "🛻",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    accent: "text-orange-700",
    accentSoft: "bg-orange-50 text-orange-800",
    ring: "ring-orange-200",
  },
  canter: {
    emoji: "🚚",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    accent: "text-teal-700",
    accentSoft: "bg-teal-50 text-teal-800",
    ring: "ring-teal-200",
  },
  lorry: {
    emoji: "🚛",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    accent: "text-violet-700",
    accentSoft: "bg-violet-50 text-violet-800",
    ring: "ring-violet-200",
  },
};

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: "van",
    name: "Van",
    capacity: "10–15 boxes, small items",
    bestFor: "Studio or single room",
    exampleLoad: "Bags, boxes, small appliances",
    basePriceKes: 3500,
    theme: VEHICLE_THEMES.van,
  },
  {
    id: "pickup",
    name: "Pickup",
    capacity: "20–30 boxes + light furniture",
    bestFor: "1-bedroom or partial move",
    exampleLoad: "Mattress, sofa, boxes, TV",
    basePriceKes: 5500,
    theme: VEHICLE_THEMES.pickup,
  },
  {
    id: "canter",
    name: "Canter (3-ton)",
    capacity: "Full 1–2 bedroom home",
    bestFor: "Standard apartment move",
    exampleLoad: "Beds, wardrobes, dining set, boxes",
    basePriceKes: 9000,
    theme: VEHICLE_THEMES.canter,
  },
  {
    id: "lorry",
    name: "Lorry (7-ton+)",
    capacity: "Full 3+ bedroom home",
    bestFor: "Large house or office move",
    exampleLoad: "Full household plus appliances",
    basePriceKes: 15000,
    theme: VEHICLE_THEMES.lorry,
  },
];

export function getVehicleById(id: VehicleTypeId): VehicleOption | undefined {
  return VEHICLE_OPTIONS.find((vehicle) => vehicle.id === id);
}
