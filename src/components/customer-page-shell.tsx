import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MotionFadeUp, MotionGlowOrb } from "@/components/motion-section";

type CustomerPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  badges?: Array<{ icon: string; text: string }>;
  heroImageSrc?: string;
  heroImageAlt?: string;
  children: ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
};

const maxWidthClass = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
} as const;

export function CustomerPageShell({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  badges,
  heroImageSrc,
  heroImageAlt = "",
  children,
  maxWidth = "3xl",
}: CustomerPageShellProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-amber-50/40">
      <MotionGlowOrb className="left-[-5rem] top-0 h-72 w-72 bg-teal-300/30" />
      <MotionGlowOrb className="right-[-4rem] top-32 h-64 w-64 bg-cyan-300/25" />

      <section
        className={`relative overflow-hidden border-b border-teal-100 px-4 py-12 text-white sm:px-6 sm:py-16 ${
          heroImageSrc ? "min-h-[22rem] sm:min-h-[26rem]" : "bg-gradient-to-br from-teal-800 to-teal-950 sm:py-14"
        }`}
      >
        {heroImageSrc ? (
          <>
            <Image
              src={heroImageSrc}
              alt={heroImageAlt}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-teal-900/88 via-teal-900/82 to-teal-950/90"
              aria-hidden
            />
          </>
        ) : null}

        <div className={`relative z-10 mx-auto ${maxWidthClass[maxWidth]}`}>
          <MotionFadeUp>
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-200 transition hover:text-white"
              >
                ← {backLabel}
              </Link>
            ) : null}
            <p
              className={`text-sm font-semibold uppercase tracking-[0.2em] text-teal-200 ${backHref ? "mt-4" : ""}`}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-teal-100 sm:text-lg">
              {description}
            </p>
          </MotionFadeUp>

          {badges && badges.length > 0 ? (
            <MotionFadeUp delay={150}>
              <div className="mt-6 flex flex-wrap gap-3">
                {badges.map((item) => (
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
          ) : null}
        </div>
      </section>

      <div className={`relative mx-auto ${maxWidthClass[maxWidth]} px-4 py-10 sm:px-6`}>
        <MotionFadeUp delay={200}>{children}</MotionFadeUp>
      </div>
    </div>
  );
}
