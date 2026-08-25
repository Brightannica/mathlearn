"use client";

import { useState, memo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Trophy,
  Flame,
  Target,
  MessageSquare,
  X,
  CheckCheck,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  achievement: <Trophy className="h-5 w-5 text-yellow-500" />,
  streak: <Flame className="h-5 w-5 text-orange-500" />,
  assignment: <Target className="h-5 w-5 text-blue-500" />,
  message: <MessageSquare className="h-5 w-5 text-green-500" />,
  system: <Bell className="h-5 w-5 text-gray-500" />,
};

const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg hover:bg-muted/50 transition-colors relative group border",
        !notification.read && "bg-primary/5 border-primary/20"
      )}
      onClick={onMarkRead}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">
          {iconMap[notification.type] || <Bell className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{notification.title}</p>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notification.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
NotificationItem.displayName = "NotificationItem";

function NotificationSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex gap-3">
          <div className="animate-pulse bg-muted rounded h-5 w-5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="animate-pulse bg-muted rounded h-4 w-3/4" />
            <div className="animate-pulse bg-muted rounded h-3 w-full" />
            <div className="animate-pulse bg-muted rounded h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Please sign in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="hidden sm:flex"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="sm:hidden w-full"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all as read
        </Button>
      )}

      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-240px)]">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {filter === "unread"
                    ? "You've read all your notifications."
                    : "When you get notifications, they'll show up here."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
