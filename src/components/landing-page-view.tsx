import Image from "next/image";
import Link from "next/link";
import { LandingImpactSection } from "@/components/landing-impact-section";
import { VehicleCard } from "@/components/vehicle-card";
import type { LandingContent } from "@/lib/landing-content";
import { VEHICLE_OPTIONS } from "@/lib/vehicles";

type LandingPageViewProps = {
  content: LandingContent;
};

export function LandingPageView({ content }: LandingPageViewProps) {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-gradient-to-br from-teal-800 to-teal-950 text-white">
        {content.heroImageUrl ? (
          <Image
            src={content.heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : null}

        <div
          className="absolute inset-0 bg-gradient-to-br from-teal-800/92 via-teal-900/88 to-teal-950/90"
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-teal-200">
              {content.badgeText}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-teal-100">
              {content.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/book"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
              >
                {content.primaryButtonText}
              </Link>
              <Link
                href="/driver/register"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {content.secondaryButtonText}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">{content.howItWorksTitle}</h2>
            <ol className="mt-4 space-y-4 text-sm leading-7 text-teal-50">
              {content.howItWorksSteps.map((step, index) => (
                <li key={`${step}-${index}`}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <LandingImpactSection content={content} />

      {content.galleryImages.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">{content.galleryTitle}</h2>
            <p className="mt-3 text-slate-600">{content.galleryDescription}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.galleryImages.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
              >
                <Image
                  src={imageUrl}
                  alt={`Relocate gallery ${index + 1}`}
                  width={800}
                  height={600}
                  className="h-56 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-gradient-to-b from-amber-50 via-white to-teal-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
              Our fleet
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              {content.vehiclesSectionTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {content.vehiclesSectionDescription}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {VEHICLE_OPTIONS.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
