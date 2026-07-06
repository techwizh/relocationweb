export type CompanyContact = {
  companyName: string;
  tagline: string;
  linkedInUrl: string;
  instagramUrl: string;
  whatsAppUrl: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
};

export function getCompanyContact(): CompanyContact {
  const phoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+254712345678";
  const phoneDigits = phoneRaw.replace(/\D/g, "");

  return {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Techwiz Company",
    tagline:
      process.env.NEXT_PUBLIC_COMPANY_TAGLINE ??
      "Building reliable digital platforms for Kenya.",
    linkedInUrl:
      process.env.NEXT_PUBLIC_CONTACT_LINKEDIN ??
      "https://www.linkedin.com/in/victor-kioko",
    instagramUrl:
      process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM ??
      "https://www.instagram.com/techwizcompany",
    whatsAppUrl:
      process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ??
      `https://wa.me/${phoneDigits}?text=${encodeURIComponent("Hello Techwiz, I have an inquiry about Relocate.")}`,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@techwiz.co.ke",
    phoneDisplay: phoneRaw,
    phoneTel: phoneRaw.startsWith("+") ? phoneRaw : `+${phoneDigits}`,
  };
}
