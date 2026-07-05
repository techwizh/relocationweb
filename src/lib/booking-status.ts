import type { BookingStatus } from "@prisma/client";

export const ACTIVE_JOB_STATUSES: BookingStatus[] = [
  "ASSIGNED",
  "EN_ROUTE",
  "LOADING",
  "IN_TRANSIT",
];

export const TRACKABLE_BOOKING_STATUSES: BookingStatus[] = [
  "ASSIGNED",
  "EN_ROUTE",
  "LOADING",
  "IN_TRANSIT",
  "DELIVERED",
];

const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  ASSIGNED: "EN_ROUTE",
  EN_ROUTE: "LOADING",
  LOADING: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const STATUS_ACTION_LABELS: Partial<Record<BookingStatus, string>> = {
  ASSIGNED: "Start trip",
  EN_ROUTE: "Arrived — start loading",
  LOADING: "Loading complete — in transit",
  IN_TRANSIT: "Mark delivered",
};

export function getNextBookingStatus(
  current: BookingStatus,
): BookingStatus | null {
  return NEXT_STATUS[current] ?? null;
}

export function getStatusActionLabel(current: BookingStatus): string | null {
  return STATUS_ACTION_LABELS[current] ?? null;
}

export function canTransitionBookingStatus(
  current: BookingStatus,
  next: BookingStatus,
): boolean {
  return getNextBookingStatus(current) === next;
}

export function isActiveJobStatus(status: BookingStatus): boolean {
  return ACTIVE_JOB_STATUSES.includes(status);
}
