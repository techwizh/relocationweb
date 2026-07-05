import { BookingAssignmentPanel } from "@/components/admin/booking-assignment-panel";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-display";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

export default async function AdminBookingsPage() {
  const [bookings, approvedDrivers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: {
          in: ["PAID", "ASSIGNED", "EN_ROUTE", "LOADING", "IN_TRANSIT"],
        },
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.driverProfile.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        vehicle: {
          select: {
            type: true,
            plateNumber: true,
          },
        },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-3 text-slate-600">
        Assign paid customer bookings to approved drivers in your fleet.
      </p>

      <div className="mt-8">
        <BookingAssignmentPanel
          initialBookings={bookings.map((booking) => ({
            id: booking.id,
            status: booking.status,
            statusLabel: BOOKING_STATUS_LABELS[booking.status],
            contactName: booking.contactName,
            contactPhone: booking.contactPhone,
            city: booking.city,
            pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
            dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
            scheduledAt: booking.scheduledAt.toISOString(),
            estimatedPrice: booking.estimatedPrice,
            vehicleLabel: VEHICLE_TYPE_LABELS[booking.vehicleType],
            notes: booking.notes,
            driverId: booking.driverId,
            driverName: booking.driver?.user.fullName ?? null,
          }))}
          initialDrivers={approvedDrivers.map((driver) => ({
            id: driver.id,
            fullName: driver.user.fullName,
            plateNumber: driver.vehicle?.plateNumber ?? null,
            isAvailable: driver.isAvailable,
          }))}
        />
      </div>
    </div>
  );
}
