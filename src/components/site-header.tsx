import Link from "next/link";
import { getCustomerUser } from "@/lib/customer-auth";

const navLinks = [
  { href: "/book", label: "Book a move" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/driver/register", label: "Become a driver" },
  { href: "/admin", label: "Admin" },
];

export async function SiteHeader() {
  const customer = await getCustomerUser();

  return (
    <header className="border-b border-teal-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-teal-800">
          Relocate
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-teal-700"
            >
              {link.label}
            </Link>
          ))}
          {customer ? (
            <Link href="/account" className="transition-colors hover:text-teal-700">
              My account
            </Link>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-teal-700">
                Sign in
              </Link>
              <Link href="/register" className="transition-colors hover:text-teal-700">
                Register
              </Link>
            </>
          )}
        </nav>
        <Link
          href="/book"
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
        >
          Book now
        </Link>
      </div>
    </header>
  );
}
