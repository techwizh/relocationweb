import { DriverPortalDashboard } from "@/components/driver-portal-dashboard";
import { fetchApi } from "@/lib/api-server";
import type { VehicleType } from "@prisma/client";

export default async function DriverDashboardPage() {
  const { ok, data } = await fetchApi<{
    user: {
      fullName: string;
      email: string;
      driverProfile: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        rejectionReason: string | null;
        isAvailable: boolean;
        vehicle: {
          type: string;
          make: string;
          model: string;
          plateNumber: string;
        } | null;
      };
    };
    jobs: Parameters<typeof DriverPortalDashboard>[0]["jobs"];
  }>("/api/driver/dashboard");

  if (!ok || !data) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Driver portal</h1>
      <p className="mt-3 text-slate-600">
        Manage availability, view assigned jobs, and chat with customers.
      </p>

      <div className="mt-8">
        <DriverPortalDashboard
          fullName={data.user.fullName}
          email={data.user.email}
          driverStatus={data.user.driverProfile.status}
          rejectionReason={data.user.driverProfile.rejectionReason}
          isAvailable={data.user.driverProfile.isAvailable}
          vehicle={
            data.user.driverProfile.vehicle
              ? {
                  ...data.user.driverProfile.vehicle,
                  type: data.user.driverProfile.vehicle.type as VehicleType,
                }
              : null
          }
          jobs={data.jobs}
        />
      </div>
    </div>
  );
}
