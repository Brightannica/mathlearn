"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Trophy,
  FlaskConical,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Target,
  Users,
  Calculator,
  BarChart3,
  BookText,
  Brain,
  UsersRound,
  Zap,
  Star,
  Menu,
  X,
  Flame,
  LogOut,
  Search,
  Compass,
  Bookmark,
  Swords,
  UserPlus,
  Send,
  Code2,
  Sparkles,
  Circle,
  Layers,
  LineChart,
  Hexagon,
  TrendingUp,
  Activity,
  Music,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daily Drill", href: "/daily-drill", icon: Flame },
  { name: "Problem of the Day", href: "/daily", icon: Flame },
  { name: "Search", href: "/search", icon: Search },
  { name: "Onboarding", href: "/onboarding", icon: Flame },
  { name: "Learning Path", href: "/path", icon: Compass },
  { name: "Formula Practice", href: "/formulas", icon: Sparkles },
  { name: "Unit Circle", href: "/unit-circle", icon: Circle },
  { name: "Fractions", href: "/fractions", icon: Layers },
  { name: "Linear Equations", href: "/linear", icon: LineChart },
  { name: "Glossary", href: "/glossary", icon: BookText },
  { name: "Shape Explorer", href: "/shapes", icon: Hexagon },
  { name: "Quadratic Solver", href: "/quadratic", icon: TrendingUp },
  { name: "Exponentials", href: "/exponentials", icon: Activity },
  { name: "Sine Wave", href: "/sine-wave", icon: Music },
  { name: "Notifications", href: "/notifications", icon: Flame },
  { name: "Quiz", href: "/quiz", icon: Brain },
  { name: "Courses", href: "/learn", icon: BookOpen },
  { name: "Solve", href: "/solve", icon: Code2 },
  { name: "Review (SRS)", href: "/review", icon: Brain },
  { name: "Formulas", href: "/cheatsheet", icon: BookText },
  { name: "Study Groups", href: "/study", icon: UsersRound },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "Daily Challenge", href: "/daily-challenges", icon: Zap },
  { name: "Multiplayer", href: "/multiplayer", icon: Swords },
  { name: "Tools", href: "/tools", icon: Calculator },
  { name: "Visualizations", href: "/visualizations", icon: FlaskConical },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: Flame },
  { name: "Streaks", href: "/streaks", icon: Flame },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: Users },
  { name: "Friends", href: "/friends", icon: UserPlus },
  { name: "Chat", href: "/chat", icon: Send },
  { name: "Favorites", href: "/favorites", icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="lg:hidden fixed top-4 left-4 z-50 bg-background border"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r sidebar-border transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-4 border-b sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">mathitout</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t sidebar-border p-3 space-y-2">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <NotificationsDropdown />
              <ThemeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left text-sm">
                    <p className="font-medium truncate">{session?.user?.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{session?.user?.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex w-full items-center justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex w-full items-center justify-start">
                    <Star className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
