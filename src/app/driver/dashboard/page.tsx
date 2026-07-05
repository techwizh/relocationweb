import { DriverPortalDashboard } from "@/components/driver-portal-dashboard";
import { toDriverJobRecord } from "@/lib/booking-display";
import { getDriverUser } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";

export default async function DriverDashboardPage() {
  const user = await getDriverUser();

  if (!user?.driverProfile) {
    return null;
  }

  const jobs = await prisma.booking.findMany({
    where: {
      driverId: user.driverProfile.id,
      status: {
        in: ["ASSIGNED", "EN_ROUTE", "LOADING", "IN_TRANSIT", "DELIVERED"],
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Driver portal</h1>
      <p className="mt-3 text-slate-600">
        Manage availability, view assigned jobs, and chat with customers.
      </p>

      <div className="mt-8">
        <DriverPortalDashboard
          fullName={user.fullName}
          email={user.email}
          driverStatus={user.driverProfile.status}
          rejectionReason={user.driverProfile.rejectionReason}
          isAvailable={user.driverProfile.isAvailable}
          vehicle={
            user.driverProfile.vehicle
              ? {
                  type: user.driverProfile.vehicle.type,
                  make: user.driverProfile.vehicle.make,
                  model: user.driverProfile.vehicle.model,
                  plateNumber: user.driverProfile.vehicle.plateNumber,
                }
              : null
          }
          jobs={jobs.map(toDriverJobRecord)}
        />
      </div>
    </div>
  );
}
