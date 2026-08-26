"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { RealtimeProvider } from "@/components/realtime-provider";
import { KeepAlive } from "@/components/keep-alive";
import { ColdStartWatchdog } from "@/components/cold-start-watchdog";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsPalette } from "@/components/shortcuts-palette";
import { GlobalShortcuts } from "@/components/global-shortcuts";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider>
            <KeepAlive />
            <ColdStartWatchdog />
            <CommandPalette />
            <ShortcutsPalette />
            <GlobalShortcuts />
            {children}
          </RealtimeProvider>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
