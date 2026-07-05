export type VehicleTypeId = "van" | "pickup" | "canter" | "lorry";

export type VehicleOption = {
  id: VehicleTypeId;
  name: string;
  capacity: string;
  bestFor: string;
  exampleLoad: string;
  basePriceKes: number;
};

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: "van",
    name: "Van",
    capacity: "10–15 boxes, small items",
    bestFor: "Studio or single room",
    exampleLoad: "Bags, boxes, small appliances",
    basePriceKes: 3500,
  },
  {
    id: "pickup",
    name: "Pickup",
    capacity: "20–30 boxes + light furniture",
    bestFor: "1-bedroom or partial move",
    exampleLoad: "Mattress, sofa, boxes, TV",
    basePriceKes: 5500,
  },
  {
    id: "canter",
    name: "Canter (3-ton)",
    capacity: "Full 1–2 bedroom home",
    bestFor: "Standard apartment move",
    exampleLoad: "Beds, wardrobes, dining set, boxes",
    basePriceKes: 9000,
  },
  {
    id: "lorry",
    name: "Lorry (7-ton+)",
    capacity: "Full 3+ bedroom home",
    bestFor: "Large house or office move",
    exampleLoad: "Full household plus appliances",
    basePriceKes: 15000,
  },
];

export function getVehicleById(id: VehicleTypeId): VehicleOption | undefined {
  return VEHICLE_OPTIONS.find((vehicle) => vehicle.id === id);
}
