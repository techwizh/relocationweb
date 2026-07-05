import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/customer-auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCustomerUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/login?type=customer&next=/account");
  }

  return children;
}
