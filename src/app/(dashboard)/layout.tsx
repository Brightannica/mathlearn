import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/main-layout";

export async function generateMetadata() {
  return {
    title: {
      default: "Dashboard",
      template: "%s | mathitout",
    },
    description: "Your math learning dashboard.",
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}