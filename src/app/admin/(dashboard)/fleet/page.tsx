import { AdminFleetPanel } from "@/components/admin/fleet-panel";

export default function AdminFleetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Fleet tracking</h1>
      <p className="mt-3 text-slate-600">
        See approved drivers on the map when they share location from the driver
        portal.
      </p>

      <div className="mt-8">
        <AdminFleetPanel />
      </div>
    </div>
  );
}
