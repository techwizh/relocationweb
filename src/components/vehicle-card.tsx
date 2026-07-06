import Link from "next/link";
import type { VehicleOption } from "@/lib/vehicles";

type VehicleCardProps = {
  vehicle: VehicleOption;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { theme } = vehicle;

  return (
    <article
      className={`group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ${theme.ring} transition hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className={`bg-gradient-to-br ${theme.gradient} px-6 py-5 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-4xl" aria-hidden>
              {theme.emoji}
            </span>
            <h3 className="mt-3 text-2xl font-bold">{vehicle.name}</h3>
          </div>
          <div className="rounded-2xl bg-white/20 px-4 py-2 text-right backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">From</p>
            <p className="text-xl font-bold">KES {vehicle.basePriceKes.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <FeaturePill
            icon="📦"
            label="Capacity"
            value={vehicle.capacity}
            className={theme.accentSoft}
          />
          <FeaturePill
            icon="🏠"
            label="Best for"
            value={vehicle.bestFor}
            className={theme.accentSoft}
          />
          <FeaturePill
            icon="✅"
            label="Example load"
            value={vehicle.exampleLoad}
            className={theme.accentSoft}
          />
        </div>

        <Link
          href={`/book?vehicle=${vehicle.id}`}
          className={`inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r ${theme.gradient} px-5 py-3 text-sm font-semibold text-white transition group-hover:opacity-95`}
        >
          Book {vehicle.name.toLowerCase()}
        </Link>
      </div>
    </article>
  );
}

function FeaturePill({
  icon,
  label,
  value,
  className,
}: {
  icon: string;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-3 ${className}`}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
        <span aria-hidden>{icon}</span>
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-6">{value}</p>
    </div>
  );
}
