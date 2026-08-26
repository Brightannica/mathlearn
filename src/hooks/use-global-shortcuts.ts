"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<string, string> = {
  d: "/dashboard",
  l: "/learn",
  s: "/solve",
  p: "/practice",
  q: "/quiz",
  r: "/review",
  f: "/cheatsheet",
  t: "/tools",
  a: "/achievements",
};

export function useGlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let pendingG = false;
    let gTimeout: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target?.matches("input, textarea, [contenteditable]")) return;

      // Shift+L for theme toggle
      if (e.shiftKey && e.key === "L" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const html = document.documentElement;
        if (html.classList.contains("dark")) {
          html.classList.remove("dark");
          localStorage.setItem("mathitout-theme", "light");
        } else {
          html.classList.add("dark");
          localStorage.setItem("mathitout-theme", "dark");
        }
        return;
      }

      // G + key for navigation
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        pendingG = true;
        if (gTimeout) clearTimeout(gTimeout);
        gTimeout = setTimeout(() => { pendingG = false; }, 1000);
        return;
      }

      if (pendingG && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const route = ROUTES[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          pendingG = false;
          if (gTimeout) clearTimeout(gTimeout);
          router.push(route);
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [router]);
}
