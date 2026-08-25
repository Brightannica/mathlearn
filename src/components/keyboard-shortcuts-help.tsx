"use client";

import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const [show, setShow] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "?") {
        event.preventDefault();
        setShow((prev) => !prev);
      }
      if (event.key === "Escape") {
        setShow(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {shortcut.ctrl ? "Ctrl+" : ""}{shortcut.shift ? "Shift+" : ""}{shortcut.alt ? "Alt+" : ""}{shortcut.key.toUpperCase()}
              </kbd>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Show keyboard shortcuts</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift+?</kbd>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
