import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { getCustomerUser } from "@/lib/customer-auth";
import { isMpesaPaymentSkipped, isMpesaSandbox } from "@/lib/payment-config";
import { isMpesaConfigured } from "@/lib/mpesa";
import { VEHICLE_OPTIONS, type VehicleTypeId } from "@/lib/vehicles";

function resolveInitialVehicle(vehicleParam?: string): VehicleTypeId | undefined {
  if (!vehicleParam) return undefined;
  return VEHICLE_OPTIONS.find((vehicle) => vehicle.id === vehicleParam)?.id;
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle: vehicleParam } = await searchParams;
  const skipPayment = isMpesaPaymentSkipped();
  const isSandbox = isMpesaSandbox();
  const mpesaConfigured = isMpesaConfigured();
  const customer = await getCustomerUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Book your move</h1>
      <p className="mt-3 text-slate-600">
        Choose your city, sub-county, and ward for both pick-up and drop-off.
        Add your phone number so we can reach you about your booking.
      </p>

      {skipPayment ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          M-Pesa payment is turned off for now. After booking, you&apos;ll go
          straight to chat.
        </p>
      ) : null}

      {!skipPayment && !mpesaConfigured ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          M-Pesa is enabled but credentials are missing from <code>.env</code>.
          Add your Daraja keys and callback URL, then restart the dev server.
        </p>
      ) : null}

      {!skipPayment && mpesaConfigured && isSandbox ? (
        <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <strong>Sandbox mode.</strong> Use phone <strong>254708374149</strong>{" "}
          when booking. Keep <code>npx localtunnel --port 3000</code> running and
          update <code>MPESA_CALLBACK_URL</code> in <code>.env</code> if the tunnel
          URL changes.
        </p>
      ) : null}

      {!skipPayment && mpesaConfigured && !isSandbox ? (
        <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <strong>Live M-Pesa.</strong> Enter your real Safaricom number. You will
          receive an STK push and enter your M-Pesa PIN on your phone.
        </p>
      ) : null}

      <BookingForm
        skipPayment={skipPayment}
        isSandbox={isSandbox}
        initialContactName={customer?.fullName ?? ""}
        initialContactPhone={customer?.phone ?? ""}
        initialVehicleType={resolveInitialVehicle(vehicleParam)}
      />

      <p className="mt-6 text-sm text-slate-500">
        {customer ? (
          <>
            View all moves in{" "}
            <Link href="/account" className="font-medium text-teal-700 hover:underline">
              My account
            </Link>
            .
          </>
        ) : (
          <>
            Already booked?{" "}
            <Link
              href="/login?type=customer"
              className="font-medium text-teal-700 hover:underline"
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="font-medium text-teal-700 hover:underline">
              create an account
            </Link>{" "}
            to track your moves.
          </>
        )}
      </p>
    </div>
  );
}
