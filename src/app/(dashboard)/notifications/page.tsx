"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2, X, Trophy, Flame, Zap, Brain, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe } from "@/lib/local-state";
import { getProgressForAllSafe, checkNewAchievements } from "@/lib/achievements";
import { getCustomContext } from "@/lib/achievements";

const STORAGE_KEY = "mathitout-notifications-v1";

type Notification = {
  id: string;
  type: "achievement" | "streak" | "level" | "system";
  title: string;
  description: string;
  href?: string;
  createdAt: number;
  read: boolean;
};

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveNotifications(n: Notification[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n.slice(-50))); } catch {}
}

export default function NotificationsPage() {
  const [tick, setTick] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    // Check for new achievements and add them as notifications
    const newOnes = checkNewAchievements();
    if (newOnes.length > 0) {
      const existing = loadNotifications();
      const newNotifs: Notification[] = newOnes.map((a) => ({
        id: `ach-${a.id}-${Date.now()}`,
        type: "achievement",
        title: `achievement unlocked: ${a.title}`,
        description: a.description,
        href: "/achievements",
        createdAt: Date.now(),
        read: false,
      }));
      const updated = [...existing, ...newNotifs].slice(-50);
      saveNotifications(updated);
      setNotifications(updated);
    }
  }, [tick]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const remove = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const typeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "achievement": return Trophy;
      case "streak": return Flame;
      case "level": return Zap;
      case "system": return Sparkles;
    }
  };

  const typeColor = (type: Notification["type"]) => {
    switch (type) {
      case "achievement": return "text-amber-400";
      case "streak": return "text-orange-400";
      case "level": return "text-[#c4f000]";
      case "system": return "text-sky-400";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// inbox</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7" />
            notifications
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">achievements, milestones, and updates.</p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button onClick={markAllRead} variant="outline" className="border-zinc-800 hover:border-zinc-700">
            <CheckCheck className="h-4 w-4 mr-2" /> mark all read
          </Button>
        )}
      </div>

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-3">
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">total</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{notifications.length}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">unread</div>
          <div className="text-2xl font-bold text-[#c4f000] mt-1">{unreadCount}</div>
        </div>
        <div className="bg-[#0d0d0d] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">achievements</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{notifications.filter((n) => n.type === "achievement").length}</div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-12 text-center">
          <Bell className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400">no notifications yet</p>
          <p className="text-xs text-zinc-600 mt-1">solve problems, complete daily drills, and unlock achievements to fill this up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.slice().reverse().map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "border p-4 flex items-start gap-3 group transition-colors",
                  n.read ? "border-zinc-800/40 bg-[#0d0d0d]" : "border-zinc-700 bg-[#0f0f0f]"
                )}
              >
                <div className={cn("p-2 shrink-0", typeColor(n.type))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#c4f000]" />}
                  </div>
                  <p className="text-xs text-zinc-500">{n.description}</p>
                  <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {n.href && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead(n.id)}
                      className="h-7 text-xs"
                    >
                      <Link href={n.href}>view</Link>
                    </Button>
                  )}
                  {!n.read && (
                    <Button
                      onClick={() => markRead(n.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    onClick={() => remove(n.id)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
