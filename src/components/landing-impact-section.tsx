import type { LandingContent } from "@/lib/landing-content";

type LandingImpactSectionProps = {
  content: LandingContent;
};

export function LandingImpactSection({ content }: LandingImpactSectionProps) {
  if (!content.impactStats.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 px-4 py-20 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(20,184,166,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.15), transparent 35%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            {content.foundedLabel} {content.foundedYear}
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {content.impactSectionTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-teal-100/90 sm:text-lg">
            {content.impactSectionDescription}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-teal-900/80 to-slate-900/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-2xl">
              🏁
            </div>
            <p className="mt-5 text-4xl font-bold text-white">{content.foundedYear}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
              {content.foundedLabel}
            </p>
          </article>

          {content.impactStats.map((stat) => (
            <article
              key={`${stat.value}-${stat.label}`}
              className="rounded-2xl border border-white/10 bg-teal-900/40 p-6 text-center shadow-lg backdrop-blur-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-2xl">
                {stat.icon}
              </div>
              <p className="mt-5 text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
