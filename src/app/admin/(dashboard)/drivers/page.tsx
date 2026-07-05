import { DriverReviewList } from "@/components/admin/driver-review-list";
import { fetchApi } from "@/lib/api-server";
import type { DriverReviewRecord } from "@/lib/driver-display";
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

  const { ok, data } = await fetchApi<{ drivers: DriverReviewRecord[] }>(
    `/api/admin/drivers?status=${status}`,
  );

  const initialDrivers = ok && data ? data.drivers : [];

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
