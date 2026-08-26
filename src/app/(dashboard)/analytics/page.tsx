"use client";

import { PracticeAnalytics } from "@/components/practice-analytics";
import { BarChart3, Activity } from "lucide-react";

export default function PracticeAnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// deep analytics</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-7 w-7" />
          practice analytics
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">when you practice, how you're doing, and where to focus next.</p>
      </div>

      <PracticeAnalytics />
    </div>
  );
}
