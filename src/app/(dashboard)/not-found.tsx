import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">This page doesn&apos;t exist in your dashboard.</p>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
