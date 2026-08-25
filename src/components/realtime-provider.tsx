"use client";

import { useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const notificationsChannel = supabase
      .channel("realtime:notifications:global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {}
      )
      .subscribe();

    const postsChannel = supabase
      .channel("realtime:posts:global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_posts",
        },
        () => {}
      )
      .subscribe();

    const repliesChannel = supabase
      .channel("realtime:replies:global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_replies",
        },
        () => {}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, [session?.user?.id]);

  return <>{children}</>;
}
