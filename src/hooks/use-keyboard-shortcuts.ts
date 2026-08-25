"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

type Shortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
};

export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts = useMemo<Shortcut[]>(() => [
    {
      key: "g",
      ctrl: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "l",
      ctrl: true,
      action: () => router.push("/learn"),
      description: "Go to Learn",
    },
    {
      key: "p",
      ctrl: true,
      action: () => router.push("/practice"),
      description: "Go to Practice",
    },
    {
      key: "c",
      ctrl: true,
      action: () => router.push("/community"),
      description: "Go to Community",
    },
    {
      key: "n",
      ctrl: true,
      action: () => router.push("/notifications"),
      description: "Go to Notifications",
    },
    {
      key: "s",
      ctrl: true,
      action: () => router.push("/settings"),
      description: "Go to Settings",
    },
  ], [router]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
