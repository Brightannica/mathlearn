"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
      <div className="max-w-md space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 border border-rose-500/30 bg-rose-500/5">
          <AlertTriangle className="h-7 w-7 text-rose-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-zinc-100">something went wrong</h2>
          <p className="text-sm text-zinc-500">
            an unexpected error occurred while loading this page.
            {error.digest && <span className="block text-[10px] text-zinc-700 mt-1 font-mono">error: {error.digest}</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button onClick={reset} className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <RefreshCw className="h-4 w-4 mr-2" /> try again
          </Button>
          <Button asChild variant="outline" className="border-zinc-800">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" /> dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
