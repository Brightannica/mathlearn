"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">
        Skip to main content
      </a>
      <main
        id="main-content"
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          "lg:ml-0",
          "pb-14 lg:pb-0"
        )}
      >
        <div className="flex flex-col min-h-full">
          <div className="flex-1 p-4 lg:p-6 xl:p-8 animate-in fade-in">
            {children}
          </div>
          <footer className="border-t px-4 py-4 text-xs text-muted-foreground">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <span>© {new Date().getFullYear()} mathitout</span>
              <span>Built for learners, by learners.</span>
            </div>
          </footer>
        </div>
      </main>
      <MobileBottomNav />
      <KeyboardShortcutsHelp />
    </div>
  );
}
