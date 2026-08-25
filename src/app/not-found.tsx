"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </div>
        <p className="text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/learn">
              <Search className="h-4 w-4 mr-2" />
              Browse Courses
            </Link>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
