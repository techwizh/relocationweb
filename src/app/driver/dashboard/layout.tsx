import { redirect } from "next/navigation";
import { getDriverUser } from "@/lib/driver-auth";

export default async function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDriverUser();

  if (!user || user.role !== "DRIVER" || !user.driverProfile) {
    redirect("/login?next=/driver/dashboard");
  }

  return children;
}
