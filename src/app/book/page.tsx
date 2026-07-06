import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { MotionFadeUp, MotionGlowOrb } from "@/components/motion-section";
import { getCustomerUser } from "@/lib/customer-auth";
import {
  isMpesaPaymentSkipped,
  isMpesaSandbox,
  shouldShowMpesaConfigWarning,
} from "@/lib/payment-config";
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
  const showMpesaConfigWarning = shouldShowMpesaConfigWarning(mpesaConfigured);
  const customer = await getCustomerUser();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-amber-50/40">
      <MotionGlowOrb className="left-[-5rem] top-0 h-72 w-72 bg-teal-300/30" />
      <MotionGlowOrb className="right-[-4rem] top-32 h-64 w-64 bg-cyan-300/25" />

      <section className="relative border-b border-teal-100 bg-gradient-to-br from-teal-800 to-teal-950 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <MotionFadeUp>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
              Book a move
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Plan your relocation</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-teal-100">
              Choose your city, pick-up and drop-off locations, vehicle size, and move
              date. We&apos;ll confirm your booking in minutes.
            </p>
          </MotionFadeUp>

          <MotionFadeUp delay={150}>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: "📍", text: "Mombasa & Nairobi" },
                { icon: "💳", text: skipPayment ? "Instant confirm" : "M-Pesa pay" },
                { icon: "🚚", text: "Verified drivers" },
              ].map((item) => (
                <span
                  key={item.text}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm"
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </MotionFadeUp>
        </div>
      </section>

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {skipPayment ? (
          <MotionFadeUp delay={100}>
            <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              M-Pesa payment is turned off for now. After booking, you&apos;ll go straight
              to chat.
            </p>
          </MotionFadeUp>
        ) : null}

        {showMpesaConfigWarning ? (
          <MotionFadeUp delay={100}>
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              M-Pesa is enabled but credentials are missing. Add your Daraja keys on the
              backend server.
            </p>
          </MotionFadeUp>
        ) : null}

        {!skipPayment && mpesaConfigured && isSandbox ? (
          <MotionFadeUp delay={100}>
            <p className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              <strong>Sandbox mode.</strong> Test with phone <strong>254708374149</strong>.
            </p>
          </MotionFadeUp>
        ) : null}

        {!skipPayment && mpesaConfigured && !isSandbox ? (
          <MotionFadeUp delay={100}>
            <p className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              <strong>Live M-Pesa.</strong> You will receive an STK push on your phone.
            </p>
          </MotionFadeUp>
        ) : null}

        <MotionFadeUp delay={200}>
          <BookingForm
            skipPayment={skipPayment}
            isSandbox={isSandbox}
            initialContactName={customer?.fullName ?? ""}
            initialContactPhone={customer?.phone ?? ""}
            initialVehicleType={resolveInitialVehicle(vehicleParam)}
          />
        </MotionFadeUp>

        <MotionFadeUp delay={300}>
          <p className="mt-6 text-center text-sm text-slate-500">
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
                </Link>
                .
              </>
            )}
          </p>
        </MotionFadeUp>
      </div>
    </div>
  );
}
