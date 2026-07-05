import { DriverReviewList } from "@/components/admin/driver-review-list";
import { parsePhotoUrls, type DriverReviewRecord } from "@/lib/driver-display";
import { prisma } from "@/lib/prisma";
import type { DriverStatus } from "@prisma/client";

const ALLOWED_STATUSES = new Set<DriverStatus>(["PENDING", "APPROVED", "REJECTED"]);

function resolveStatus(value: string | undefined): DriverStatus {
  const normalized = (value ?? "PENDING").toUpperCase() as DriverStatus;
  return ALLOWED_STATUSES.has(normalized) ? normalized : "PENDING";
}

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = resolveStatus(statusParam);

  const drivers = await prisma.driverProfile.findMany({
    where: { status },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const initialDrivers: DriverReviewRecord[] = drivers.map((driver) => ({
    id: driver.id,
    status: driver.status,
    profilePhotoUrl: driver.profilePhotoUrl,
    licenseNumber: driver.licenseNumber,
    licensePhotoUrl: driver.licensePhotoUrl,
    rejectionReason: driver.rejectionReason,
    createdAt: driver.createdAt.toISOString(),
    user: {
      fullName: driver.user.fullName,
      email: driver.user.email,
      contactPhone: driver.user.phone,
    },
    vehicle: driver.vehicle
      ? {
          type: driver.vehicle.type,
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          year: driver.vehicle.year,
          color: driver.vehicle.color,
          plateNumber: driver.vehicle.plateNumber,
          photoUrls: parsePhotoUrls(driver.vehicle.photoUrls),
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Driver applications</h1>
      <p className="mt-3 text-slate-600">
        Review profile photos, license details, and vehicle information before
        approving drivers for your fleet.
      </p>

      <div className="mt-8">
        <DriverReviewList initialStatus={status} initialDrivers={initialDrivers} />
      </div>
    </div>
  );
}
