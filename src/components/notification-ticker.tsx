"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, Trophy, Zap, Flame, Star, Heart, Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe, markProblemSolved } from "@/lib/local-state";
import { checkNewAchievements, getCustomContext } from "@/lib/achievements";

const KEY = "mathitout-ticker-v1";

type Notification = {
  id: string;
  icon: "trophy" | "zap" | "flame" | "star" | "heart" | "bookmark" | "check";
  title: string;
  description: string;
  time: number;
  href?: string;
};

function iconFor(i: Notification["icon"]) {
  switch (i) {
    case "trophy": return Trophy;
    case "zap": return Zap;
    case "flame": return Flame;
    case "star": return Star;
    case "heart": return Heart;
    case "bookmark": return Bookmark;
    case "check": return Check;
  }
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function saveNotifications(ns: Notification[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(ns.slice(-20))); } catch {}
}

export function NotificationTicker() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    const prev = loadNotifications();
    setNotifications(prev);
  }, [tick]);

  // Check for new achievements
  useEffect(() => {
    const newOnes = checkNewAchievements();
    if (newOnes.length > 0) {
      const newNotifs: Notification[] = newOnes.map((a) => ({
        id: `ach-${a.id}-${Date.now()}`,
        icon: "trophy" as const,
        title: "achievement unlocked",
        description: a.title,
        time: Date.now(),
        href: "/achievements",
      }));
      const updated = [...loadNotifications(), ...newNotifs].slice(-20);
      saveNotifications(updated);
      setNotifications(updated);
      for (const n of newNotifs) {
        toast({ title: n.title, description: n.description });
      }
    }
  }, [tick, toast]);

  const state = getState();
  void tick;
  const ctx = getCustomContext();

  const visible = notifications.filter((n) => !dismissed.has(n.id)).slice(-5);

  const dismiss = (id: string) => {
    setDismissed((s) => new Set([...s, id]));
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm hidden sm:block">
      {visible.map((n) => {
        const Icon = iconFor(n.icon);
        return (
          <div
            key={n.id}
            className="border border-zinc-700 bg-[#0d0d0d] p-3 shadow-2xl flex items-start gap-2 animate-in slide-in-from-bottom"
            style={{ animation: "slideIn 0.3s ease-out" }}
          >
            <div className="p-1.5 border border-[#c4f000]/30 bg-[#c4f000]/5">
              <Icon className="h-3.5 w-3.5 text-[#c4f000]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{n.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{n.description}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="text-zinc-600 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
