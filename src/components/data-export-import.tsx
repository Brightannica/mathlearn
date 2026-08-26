"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, Trash2, Database, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPORTABLE_KEYS = [
  "mathitout-state-v1",
  "mathitout-attempts-history-v1",
  "mathitout-srs-v1",
  "mathitout-achievements-v1",
  "mathitout-perfect-quizzes-v1",
  "mathitout-courses-completed-v1",
  "mathitout-daily-done-v1",
  "mathitout-daily",
  "mathitout-theme",
  "mathitout-user-name",
  "mathitout-current-user-v1",
  "mathitout-potd-v1",
  "mathitout-potd-streak-v1",
  "mathitout-potd-streak-date-v1",
  "mathitout-notifications-v1",
];

export function DataExportImport() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<{ size: number; keys: number; xp: number; solved: number; streak: number; achievements: number } | null>(null);

  const handleExport = () => {
    try {
      const data: Record<string, unknown> = {};
      let xp = 0;
      let solved = 0;
      let streak = 0;
      let achievements = 0;
      for (const key of EXPORTABLE_KEYS) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
      const state = data["mathitout-state-v1"] as { xp?: number; solved?: unknown[]; streak?: number } | undefined;
      if (state) {
        xp = state.xp || 0;
        solved = state.solved?.length || 0;
        streak = state.streak || 0;
      }
      const earned = data["mathitout-achievements-v1"];
      if (Array.isArray(earned)) achievements = earned.length;

      const exportData = {
        app: "mathitout",
        version: 1,
        exportedAt: new Date().toISOString(),
        data,
        stats: { xp, solved, streak, achievements, keys: Object.keys(data).length },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mathitout-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPreview({
        size: JSON.stringify(exportData).length,
        keys: Object.keys(data).length,
        xp,
        solved,
        streak,
        achievements,
      });

      toast({
        title: "data exported",
        description: `${Object.keys(data).length} keys, ${xp.toLocaleString()} XP, ${solved} solved, ${streak} day streak`,
      });
    } catch (err) {
      toast({ title: "export failed", description: err instanceof Error ? err.message : "unknown error", variant: "destructive" });
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.app !== "mathitout") {
        throw new Error("invalid file: not a mathitout export");
      }
      const data = parsed.data as Record<string, unknown>;
      let count = 0;
      for (const [key, value] of Object.entries(data)) {
        try {
          localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          count++;
        } catch {}
      }
      toast({
        title: "data imported",
        description: `${count} settings restored. refresh the page to see changes.`,
      });
    } catch (err) {
      toast({ title: "import failed", description: err instanceof Error ? err.message : "unknown error", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    if (!confirm("this will erase ALL your progress: XP, streak, solved problems, achievements, everything. are you sure?")) return;
    let count = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("mathitout-")) {
        localStorage.removeItem(key);
        count++;
      }
    }
    toast({ title: "all data reset", description: `${count} keys cleared. refresh to start fresh.` });
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-zinc-500" />
        <span className="font-semibold text-sm">data management</span>
      </div>

      <p className="text-xs text-zinc-500">
        your progress is stored in your browser. export it to back up or move to another device.
      </p>

      <div className="grid sm:grid-cols-3 gap-2">
        <Button onClick={handleExport} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100">
          <Download className="h-4 w-4 mr-2" /> export data
        </Button>
        <label className="cursor-pointer">
          <Button asChild className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 w-full">
            <div>
              <Upload className="h-4 w-4 mr-2" /> {importing ? "importing..." : "import data"}
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
                disabled={importing}
              />
            </div>
          </Button>
        </label>
        <Button onClick={handleReset} variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
          <Trash2 className="h-4 w-4 mr-2" /> reset all
        </Button>
      </div>

      {preview && (
        <div className="border border-zinc-800/60 bg-[#0a0a0a] p-3 text-xs space-y-1.5">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// last export</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div><span className="text-zinc-500">size:</span> <span className="text-zinc-200">{(preview.size / 1024).toFixed(1)} KB</span></div>
            <div><span className="text-zinc-500">keys:</span> <span className="text-zinc-200">{preview.keys}</span></div>
            <div><span className="text-zinc-500">xp:</span> <span className="text-[#c4f000]">{preview.xp.toLocaleString()}</span></div>
            <div><span className="text-zinc-500">solved:</span> <span className="text-zinc-200">{preview.solved}</span></div>
            <div><span className="text-zinc-500">streak:</span> <span className="text-orange-400">{preview.streak}d</span></div>
            <div><span className="text-zinc-500">badges:</span> <span className="text-amber-400">{preview.achievements}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
