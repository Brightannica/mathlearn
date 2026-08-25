"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Calculator,
  MoreHorizontal,
  FlaskConical,
  BarChart3,
  Flame,
  Trophy,
  MessageSquare,
  Users,
  Settings,
  Star,
  Bell,
  Swords,
  UserPlus,
  Send,
  Zap,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";

const priorityItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/learn", icon: BookOpen },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Multiplayer", href: "/multiplayer", icon: Swords },
];

const moreItems = [
  { name: "Daily Challenge", href: "/daily-challenges", icon: Zap },
  { name: "Tools", href: "/tools", icon: Calculator },
  { name: "Visualizations", href: "/visualizations", icon: FlaskConical },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Streaks", href: "/streaks", icon: Flame },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: Users },
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Chat", href: "/chat", icon: Send },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: Star },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/90 backdrop-blur lg:hidden"
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {priorityItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 text-[11px] font-medium transition-colors rounded-lg whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5 mb-0.5" aria-hidden="true" />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
        
        <div className="relative" ref={moreRef}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 h-auto",
              showMore && "bg-accent"
            )}
            onClick={() => setShowMore(!showMore)}
            aria-label="More navigation"
            aria-expanded={showMore}
            aria-haspopup="true"
          >
            <MoreHorizontal className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] font-medium">More</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
          
          {showMore && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-background border rounded-lg shadow-lg">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    onClick={() => setShowMore(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
