import Link from "next/link";
import { MotionFadeUp, MotionFloat, MotionGlowOrb } from "@/components/motion-section";
import { getCompanyContact } from "@/lib/company-contact";

export default function AboutPage() {
  const company = getCompanyContact();

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 px-4 py-24 text-white sm:px-6">
        <MotionGlowOrb className="left-[-4rem] top-10 h-56 w-56 bg-teal-400/30" />
        <MotionGlowOrb className="bottom-0 right-[-3rem] h-72 w-72 bg-amber-400/20" />

        <div className="relative mx-auto max-w-4xl">
          <MotionFadeUp>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
              About us
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Powered by {company.companyName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-100/90">
              Relocate is a product of {company.companyName} — a Kenya-based team building
              practical technology for everyday problems. We launched Relocate in 2020 to make
              moving homes simpler, safer, and more transparent across Mombasa and Nairobi.
            </p>
          </MotionFadeUp>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              icon: "🎯",
              title: "Our mission",
              text: "Connect people with the right moving vehicle, verified drivers, and secure M-Pesa payments — all in one place.",
            },
            {
              icon: "🤝",
              title: "Who we serve",
              text: "Families, tenants, small businesses, and independent drivers who want fair work and reliable moves.",
            },
            {
              icon: "🛡️",
              title: "Why trust us",
              text: "Driver vetting, in-app chat, live tracking, and admin oversight keep every move accountable from booking to delivery.",
            },
          ].map((item, index) => (
            <MotionFadeUp key={item.title} delay={index * 120}>
              <article className="motion-card h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <MotionFloat>
                  <span className="text-4xl">{item.icon}</span>
                </MotionFloat>
                <h2 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </article>
            </MotionFadeUp>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <MotionFadeUp>
            <h2 className="text-3xl font-bold">Built in Kenya, for Kenya</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-teal-50">
              From M-Pesa integration to local sub-county pickers, Relocate is designed around
              how people actually move on the coast and in the capital. {company.companyName}{" "}
              continues to improve the platform with feedback from customers and drivers.
            </p>
            <Link
              href="/contact"
              className="motion-button mt-8 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-teal-800"
            >
              Get in touch
            </Link>
          </MotionFadeUp>
        </div>
      </section>
    </div>
  );
}
