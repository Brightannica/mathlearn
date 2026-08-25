"use client";

import { useState, useCallback, useEffect } from "react";

export type Favorite = {
  id: string;
  user_id: string;
  item_id: string;
  item_type: "lesson" | "exercise" | "post" | "topic";
  title: string;
  created_at: string;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error(`Failed to fetch favorites: ${res.status}`);
      const data: Favorite[] = await res.json();
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFavorites();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchFavorites]);

  const addFavorite = async (itemId: string, itemType: Favorite["item_type"], title: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType, title }),
      });
      if (!res.ok) throw new Error(`Failed to add favorite: ${res.status}`);
      const favorite: Favorite = await res.json();
      setFavorites((prev) => [favorite, ...prev]);
      return favorite;
    } catch (err) {
      console.error("Failed to add favorite:", err);
      throw err;
    }
  };

  const removeFavorite = async (itemId: string, itemType: Favorite["item_type"]) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (!res.ok) throw new Error(`Failed to remove favorite: ${res.status}`);
      setFavorites((prev) => prev.filter((f) => !(f.item_id === itemId && f.item_type === itemType)));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      throw err;
    }
  };

  const isFavorite = (itemId: string, itemType: Favorite["item_type"]) => {
    return favorites.some((f) => f.item_id === itemId && f.item_type === itemType);
  };

  const toggleFavorite = async (itemId: string, itemType: Favorite["item_type"], title: string) => {
    if (isFavorite(itemId, itemType)) {
      await removeFavorite(itemId, itemType);
    } else {
      await addFavorite(itemId, itemType, title);
    }
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
