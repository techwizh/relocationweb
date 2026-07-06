import Link from "next/link";
import { getCompanyContact } from "@/lib/company-contact";

export function SiteFooter() {
  const company = getCompanyContact();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-lg font-bold text-teal-800">Relocate</p>
          <p className="mt-1 text-sm text-slate-500">
            A product of {company.companyName} · Founded 2020
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
          <Link href="/about" className="hover:text-teal-700">
            About us
          </Link>
          <Link href="/contact" className="hover:text-teal-700">
            Contact us
          </Link>
          <Link href="/book" className="hover:text-teal-700">
            Book a move
          </Link>
          <Link href="/driver/register" className="hover:text-teal-700">
            Become a driver
          </Link>
        </nav>
      </div>
    </footer>
  );
}
