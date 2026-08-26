import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | mathitout",
  },
  description: "Practice math, track progress, and build mastery. Free, no ads, K through AP Calc.",
  robots: { index: false, follow: true },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <MainLayout>{children}</MainLayout>;
}
