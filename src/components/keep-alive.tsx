"use client";

import { useEffect } from "react";

export function KeepAlive() {
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        await fetch("/api/health", { cache: "no-store" });
      } catch {}
    };
    // ping immediately, then every 9 minutes (Render spins down after 15m idle)
    ping();
    const interval = setInterval(ping, 9 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  return null;
}
