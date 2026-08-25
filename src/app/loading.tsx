"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoadingInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingText, setLoadingText] = useState("Loading");

  useEffect(() => {
    const messages = ["Loading", "Preparing lessons", "Almost there"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{loadingText}…</p>
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background" />}>
      <LoadingInner />
    </Suspense>
  );
}
