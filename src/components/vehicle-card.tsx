import type { VehicleOption } from "@/lib/vehicles";

type VehicleCardProps = {
  vehicle: VehicleOption;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
          From KES {vehicle.basePriceKes.toLocaleString()}
        </span>
      </div>
      <dl className="space-y-2 text-sm text-slate-600">
        <div>
          <dt className="font-medium text-slate-800">Capacity</dt>
          <dd>{vehicle.capacity}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-800">Best for</dt>
          <dd>{vehicle.bestFor}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-800">Example load</dt>
          <dd>{vehicle.exampleLoad}</dd>
        </div>
      </dl>
    </article>
  );
}
