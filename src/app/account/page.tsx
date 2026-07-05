import { AccountBookings } from "@/components/account-bookings";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-display";
import { getCustomerUser } from "@/lib/customer-auth";
import { VEHICLE_TYPE_LABELS } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await getCustomerUser();

  if (!user) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    include: {
      driver: {
        include: {
          user: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">My account</h1>
      <p className="mt-3 text-slate-600">
        Track your moves, open chat, and follow your driver live.
      </p>

      <div className="mt-8">
        <AccountBookings
          fullName={user.fullName}
          email={user.email}
          phone={user.phone}
          bookings={bookings.map((booking) => ({
            id: booking.id,
            status: booking.status,
            statusLabel: BOOKING_STATUS_LABELS[booking.status],
            contactName: booking.contactName,
            pickupSummary: `${booking.pickupSubCounty}, ${booking.pickupWard}`,
            dropoffSummary: `${booking.dropoffSubCounty}, ${booking.dropoffWard}`,
            scheduledAt: booking.scheduledAt.toISOString(),
            estimatedPrice: booking.estimatedPrice,
            vehicleLabel: VEHICLE_TYPE_LABELS[booking.vehicleType],
            driverName: booking.driver?.user.fullName ?? null,
            createdAt: booking.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
