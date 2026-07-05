import type { BookingStatus, VehicleType } from "@prisma/client";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  ASSIGNED: "Assigned",
  EN_ROUTE: "En route",
  LOADING: "Loading",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type DriverJobRecord = {
  id: string;
  status: BookingStatus;
  contactName: string;
  city: string;
  pickupSummary: string;
  dropoffSummary: string;
  scheduledAt: string;
  estimatedPrice: number;
  vehicleLabel: string;
};

export function formatBookingVehicle(type: VehicleType): string {
  return VEHICLE_TYPE_LABELS[type];
}

export function toDriverJobRecord(booking: {
  id: string;
  status: BookingStatus;
  contactName: string;
  city: string;
  pickupSubCounty: string;
  pickupWard: string;
  dropoffSubCounty: string;
  dropoffWard: string;
  scheduledAt: Date;
  estimatedPrice: number;
  vehicleType: VehicleType;
}): DriverJobRecord {
  return {
    id: booking.id,
    status: booking.status,
    contactName: booking.contactName,
    city: booking.city,
    pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
    dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
    scheduledAt: booking.scheduledAt.toISOString(),
    estimatedPrice: booking.estimatedPrice,
    vehicleLabel: formatBookingVehicle(booking.vehicleType),
  };
}
