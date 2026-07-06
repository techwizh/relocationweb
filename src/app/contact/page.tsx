import Link from "next/link";
import { MotionFadeUp, MotionFloat, MotionGlowOrb } from "@/components/motion-section";
import { getCompanyContact } from "@/lib/company-contact";

const CONTACT_CHANNELS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    description: "Connect with us professionally",
    icon: "in",
    iconBg: "from-sky-500 to-blue-700",
    getHref: (c: ReturnType<typeof getCompanyContact>) => c.linkedInUrl,
    external: true,
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Follow updates and stories",
    icon: "📸",
    iconBg: "from-pink-500 via-fuchsia-500 to-purple-600",
    getHref: (c: ReturnType<typeof getCompanyContact>) => c.instagramUrl,
    external: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Chat with us instantly",
    icon: "💬",
    iconBg: "from-emerald-400 to-green-600",
    getHref: (c: ReturnType<typeof getCompanyContact>) => c.whatsAppUrl,
    external: true,
  },
  {
    key: "email",
    label: "Email",
    description: "Send a detailed inquiry",
    icon: "✉️",
    iconBg: "from-amber-400 to-orange-500",
    getHref: (c: ReturnType<typeof getCompanyContact>) => `mailto:${c.email}`,
    external: false,
  },
  {
    key: "phone",
    label: "Phone",
    description: "Speak with our team",
    icon: "📞",
    iconBg: "from-teal-500 to-cyan-600",
    getHref: (c: ReturnType<typeof getCompanyContact>) => `tel:${c.phoneTel}`,
    external: false,
  },
] as const;

export default function ContactPage() {
  const company = getCompanyContact();

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 px-4 py-24 text-white sm:px-6">
        <MotionGlowOrb className="left-10 top-8 h-48 w-48 bg-cyan-400/25" />
        <MotionGlowOrb className="right-8 top-24 h-64 w-64 bg-violet-500/20" />

        <div className="relative mx-auto max-w-4xl text-center">
          <MotionFadeUp>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
              Contact us
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">We&apos;re here to help</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Questions about booking, becoming a driver, or partnering with{" "}
              {company.companyName}? Reach out through any channel below.
            </p>
          </MotionFadeUp>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_CHANNELS.map((channel, index) => {
            const href = channel.getHref(company);
            const displayValue =
              channel.key === "email"
                ? company.email
                : channel.key === "phone"
                  ? company.phoneDisplay
                  : channel.label;

            return (
              <MotionFadeUp key={channel.key} delay={index * 100}>
                <a
                  href={href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noopener noreferrer" : undefined}
                  className="motion-card group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-lg"
                >
                  <MotionFloat>
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${channel.iconBg} text-xl font-bold text-white shadow-lg`}
                    >
                      {channel.icon}
                    </div>
                  </MotionFloat>
                  <h2 className="mt-5 text-xl font-bold text-slate-900">{channel.label}</h2>
                  <p className="mt-2 text-sm text-slate-500">{channel.description}</p>
                  <p className="mt-4 text-sm font-semibold text-teal-700 group-hover:underline">
                    {displayValue}
                  </p>
                  <span className="mt-auto pt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Tap to contact →
                  </span>
                </a>
              </MotionFadeUp>
            );
          })}

          <MotionFadeUp delay={500}>
            <div className="motion-card flex h-full flex-col rounded-3xl border border-dashed border-teal-300 bg-teal-50/80 p-6">
              <h2 className="text-xl font-bold text-teal-900">{company.companyName}</h2>
              <p className="mt-3 leading-7 text-teal-800">{company.tagline}</p>
              <p className="mt-4 text-sm text-teal-700">
                Relocate is operated by {company.companyName}. Typical response time: within
                one business day.
              </p>
              <Link
                href="/about"
                className="mt-auto inline-flex pt-6 text-sm font-semibold text-teal-800 hover:underline"
              >
                Learn more about us →
              </Link>
            </div>
          </MotionFadeUp>
        </div>
      </section>
    </div>
  );
}
