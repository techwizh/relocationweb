import type { VehicleType } from "@prisma/client";

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  VAN: "Van",
  PICKUP: "Pickup",
  CANTER: "Canter (3-ton)",
  LORRY: "Lorry (7-ton+)",
};

export function parsePhotoUrls(photoUrls: string): string[] {
  try {
    const parsed = JSON.parse(photoUrls) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export type DriverReviewRecord = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  profilePhotoUrl: string | null;
  licenseNumber: string;
  licensePhotoUrl: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    contactPhone: string | null;
  };
  vehicle: {
    type: VehicleType;
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    photoUrls: string[];
  } | null;
};
