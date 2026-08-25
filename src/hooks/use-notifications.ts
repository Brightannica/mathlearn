"use client";

import { useSession } from "next-auth/react";
import { useRealtime } from "./use-realtime";

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

export function useNotifications() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const filter = userId ? `user_id=eq.${userId}` : undefined;

  const { records, loading, setRecords } = useRealtime<Notification>(
    "notifications",
    filter,
    {
      enabled: !!userId,
      onInsert: () => {
      },
      onUpdate: () => {
      },
      onDelete: () => {
      },
    }
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error(`Failed to mark as read: ${res.status}`);
      setRecords((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error(`Failed to mark all as read: ${res.status}`);
      setRecords((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete notification: ${res.status}`);
      setRecords((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = records.filter((n) => !n.read).length;

  return {
    notifications: records,
    loading,
    error: null,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: () => setRecords([]),
    setRecords,
  };
}
