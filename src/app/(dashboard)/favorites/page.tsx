"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites, Favorite } from "@/hooks/use-favorites";
import { Bookmark, Trash2, BookOpen, Target, MessageSquare, FolderOpen } from "lucide-react";
import Link from "next/link";

const itemTypeConfig: Record<Favorite["item_type"], { label: string; icon: React.ElementType; href: string }> = {
  lesson: { label: "Lesson", icon: BookOpen, href: "/learn" },
  exercise: { label: "Exercise", icon: Target, href: "/practice" },
  post: { label: "Post", icon: MessageSquare, href: "/community" },
  topic: { label: "Topic", icon: FolderOpen, href: "/learn" },
};

export default function FavoritesPage() {
  const { favorites, loading, error, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (fav: Favorite) => {
    setRemovingId(fav.id);
    try {
      await removeFavorite(fav.item_id, fav.item_type);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-7 w-7 text-primary" />
          Favorites
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading favorites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-7 w-7 text-primary" />
          Favorites
        </h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-7 w-7 text-primary" />
          Favorites
        </h1>
        <Badge variant="secondary">{favorites.length} saved</Badge>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No favorites yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Bookmark lessons, exercises, topics, and posts to find them quickly here.
            </p>
            <Button asChild>
              <Link href="/learn">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const config = itemTypeConfig[fav.item_type];
            const Icon = config.icon;
            return (
              <Card key={fav.id} className="hover:shadow-md transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">{config.label}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(fav)}
                      disabled={removingId === fav.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Link href={config.href}>
                    <h3 className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                      {fav.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
