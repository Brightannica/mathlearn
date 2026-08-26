"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, ThumbsDown, Eye, Plus, Search, Tag, AlertCircle, X, CheckCircle2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";

type Post = {
  id: string;
  title: string;
  body: string;
  author: string;
  avatar: string;
  replies: number;
  votes: number;
  views: number;
  tags: string[];
  time: string;
};

interface Reply {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  authorImage: string | null;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
}

interface ApiPost {
  id: string;
  title: string;
  body: string;
  author_name: string;
  author_avatar: string;
  replies: number;
  votes: number;
  views: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

type DbPost = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  topic_id: string | null;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

type DbReply = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
};

const samplePosts: Post[] = [
  { id: "1", title: "How do you remember the quadratic formula?", body: "I keep mixing up the signs. Any mnemonics that worked for you?", author: "Sarah K.", avatar: "", replies: 12, votes: 34, views: 210, tags: ["Algebra", "Study-Tips"], time: "2h ago" },
  { id: "2", title: "Struggling with fractions — need help!", body: "When do I cross-multiply vs find common denominators?", author: "Miguel R.", avatar: "", replies: 8, votes: 19, views: 145, tags: ["Fractions", "Help"], time: "5h ago" },
  { id: "3", title: "Visual way to understand Pythagoras", body: "I made a desmos graph showing a² + b² = c² with squares. Sharing here!", author: "Alex T.", avatar: "", replies: 21, votes: 56, views: 402, tags: ["Geometry", "Visualization"], time: "1d ago" },
  { id: "4", title: "What calculator do you recommend for Calc?", body: "TI-84 vs Casio? Budget is around $100.", author: "Jamie L.", avatar: "", replies: 15, votes: 28, views: 178, tags: ["Calculus", "Tools"], time: "2d ago" },
];

function mapApiPost(post: ApiPost): Post {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    author: post.author_name,
    avatar: post.author_avatar,
    replies: post.replies,
    votes: post.votes,
    views: post.views,
    tags: post.tags,
    time: new Date(post.created_at).toLocaleString(),
  };
}

const PostCard = memo(function PostCard({
  post,
  onVote,
}: {
  post: Post;
  onVote: (postId: string, value: number) => void;
}) {
  return (
    <Card className="transition-all hover:shadow-md cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 min-w-[50px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onVote(post.id, 1);
              }}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-bold text-foreground text-sm">{post.votes}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onVote(post.id, -1);
              }}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">{post.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.body}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />{t}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5"><AvatarFallback className="text-[10px]">{post.author[0]}</AvatarFallback></Avatar>
                {post.author}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.replies}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
            <span>{post.time}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
PostCard.displayName = "PostCard";

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 min-w-[50px]">
            <div className="animate-pulse bg-muted rounded h-7 w-7" />
            <div className="animate-pulse bg-muted rounded h-4 w-6" />
            <div className="animate-pulse bg-muted rounded h-7 w-7" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="animate-pulse bg-muted rounded h-5 w-3/4" />
            <div className="animate-pulse bg-muted rounded h-4 w-full" />
            <div className="animate-pulse bg-muted rounded h-4 w-1/2" />
            <div className="flex gap-2">
              <div className="animate-pulse bg-muted rounded h-5 w-16" />
              <div className="animate-pulse bg-muted rounded h-5 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ReplyCard = memo(function ReplyCard({ reply, depth = 0, onReply }: { reply: Reply; depth?: number; onReply?: () => void }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold">
              {reply.authorName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{reply.authorName || "Anonymous"}</span>
              {reply.isAccepted && <Badge variant="secondary" className="text-[10px]">Accepted</Badge>}
              <span className="text-xs text-muted-foreground">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                <span>{reply.votes}</span>
              </span>
              {onReply && depth < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs hover:text-primary"
                  onClick={onReply}
                >
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
ReplyCard.displayName = "ReplyCard";

function buildReplyTree(replies: Reply[]): Map<string, Reply[]> {
  const tree = new Map<string, Reply[]>();
  const topLevel: Reply[] = [];

  for (const reply of replies) {
    if (reply.parentId) {
      const children = tree.get(reply.parentId) || [];
      children.push(reply);
      tree.set(reply.parentId, children);
    } else {
      topLevel.push(reply);
    }
  }

  return tree;
}

function ReplyTree({ replies, tree, depth = 0, onReplyTo, replyingTo, replyToContent, onReplyToContentChange, onSubmitReplyTo, submittingReplyTo }: {
  replies: Reply[];
  tree: Map<string, Reply[]>;
  depth?: number;
  onReplyTo: (id: string) => void;
  replyingTo: string | null;
  replyToContent: string;
  onReplyToContentChange: (value: string) => void;
  onSubmitReplyTo: (parentId: string) => void;
  submittingReplyTo: boolean;
}) {
  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      {replies.map((reply) => (
        <div key={reply.id}>
          <ReplyCard
            reply={reply}
            depth={depth}
            onReply={() => onReplyTo(reply.id)}
          />
          {replyingTo === reply.id && (
            <form
              onSubmit={(e) => { e.preventDefault(); onSubmitReplyTo(reply.id); }}
              className="ml-8 mt-2 space-y-2"
            >
              <Textarea
                value={replyToContent}
                onChange={(e) => onReplyToContentChange(e.target.value)}
                placeholder={`Reply to ${reply.authorName || "Anonymous"}...`}
                rows={2}
                disabled={submittingReplyTo}
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { onReplyToContentChange(""); onReplyTo(""); }}
                  disabled={submittingReplyTo}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submittingReplyTo || !replyToContent.trim()}>
                  {submittingReplyTo ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          )}
          {tree.has(reply.id) && (
            <ReplyTree
              replies={tree.get(reply.id)!}
              tree={tree}
              depth={Math.min(depth + 1, 3)}
              onReplyTo={onReplyTo}
              replyingTo={replyingTo}
              replyToContent={replyToContent}
              onReplyToContentChange={onReplyToContentChange}
              onSubmitReplyTo={onSubmitReplyTo}
              submittingReplyTo={submittingReplyTo}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyToContent, setReplyToContent] = useState("");
  const [submittingReplyTo, setSubmittingReplyTo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [unansweredPosts, setUnansweredPosts] = useState<Post[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingUnanswered, setLoadingUnanswered] = useState(false);
  const mountedRef = useRef(true);
  const userCacheRef = useRef<Map<string, { name: string; image: string | null }>>(new Map());

  const authorName = session?.user?.name || "You";
  const authorInitial = authorName[0]?.toUpperCase() || "Y";

  const { setRecords: setRealtimePosts } = useRealtime<DbPost>(
    "forum_posts",
    undefined,
    { enabled: true }
  );

  useEffect(() => {
    mountedRef.current = true;

    async function fetchPosts() {
      try {
        const res = await fetch("/api/community");
        if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
        const data: ApiPost[] = await res.json();
        if (mountedRef.current) {
          const mapped = data.map(mapApiPost);
          setPosts(mapped);
          data.forEach((post) => {
            userCacheRef.current.set(post.id, { name: post.author_name, image: post.author_avatar });
          });
          setRealtimePosts(mapped.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.body,
            user_id: p.id,
            topic_id: null,
            tags: p.tags,
            is_pinned: false,
            is_locked: false,
            views: p.views,
            created_at: p.time,
            updated_at: p.time,
          })));
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load posts");
          setPosts(samplePosts);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      mountedRef.current = false;
    };
  }, [setRealtimePosts]);

  const loadTopPosts = useCallback(async () => {
    setLoadingTop(true);
    try {
      const res = await fetch("/api/community?sort=top");
      if (!res.ok) throw new Error(`Failed to fetch top posts: ${res.status}`);
      const data: ApiPost[] = await res.json();
      if (mountedRef.current) {
        setTopPosts(data.map(mapApiPost));
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error("Failed to load top posts:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingTop(false);
      }
    }
  }, []);

  const loadUnansweredPosts = useCallback(async () => {
    setLoadingUnanswered(true);
    try {
      const res = await fetch("/api/community?filter=unanswered");
      if (!res.ok) throw new Error(`Failed to fetch unanswered posts: ${res.status}`);
      const data: ApiPost[] = await res.json();
      if (mountedRef.current) {
        setUnansweredPosts(data.map(mapApiPost));
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error("Failed to load unanswered posts:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingUnanswered(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedPostId) return;

    let cancelled = false;

    async function fetchReplies() {
      setLoadingReplies(true);
      try {
        const res = await fetch(`/api/community/${selectedPostId}/replies`);
        if (!res.ok) throw new Error(`Failed to fetch replies: ${res.status}`);
        const data: Reply[] = await res.json();
        if (!cancelled) {
          setReplies(data);
          data.forEach((reply) => {
            userCacheRef.current.set(reply.authorName, { name: reply.authorName, image: reply.authorImage ?? null });
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load replies:", err);
          setReplies([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingReplies(false);
        }
      }
    }

    fetchReplies();

    return () => {
      cancelled = true;
    };
  }, [selectedPostId]);

  const { records: realtimeReplies } = useRealtime<DbReply>(
    "forum_replies",
    selectedPostId ? `post_id=eq.${selectedPostId}` : undefined,
    { enabled: !!selectedPostId }
  );

  useEffect(() => {
    if (!selectedPostId || realtimeReplies.length === 0) return;
    const mapped = realtimeReplies.map((r) => ({
      id: r.id,
      postId: r.post_id,
      content: r.content,
      authorName: userCacheRef.current.get(r.user_id)?.name ?? "Unknown",
      authorImage: userCacheRef.current.get(r.user_id)?.image ?? null,
      votes: r.votes,
      isAccepted: r.is_accepted,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      parentId: r.parent_id,
    }));
    setReplies(mapped);
  }, [realtimeReplies, selectedPostId]);

  const handleVote = async (postId: string, value: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, votes: p.votes + value } : p
      )
    );

    try {
      const res = await fetch("/api/community/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value }),
      });

      if (!res.ok) {
        throw new Error(`Vote failed: ${res.status}`);
      }

      const result = await res.json();
      if (result.success) {
        toast({
          title: "Vote recorded",
          description: "Your vote has been saved.",
        });
      }

      const postsRes = await fetch("/api/community");
      if (postsRes.ok) {
        const data: ApiPost[] = await postsRes.json();
        const mapped = data.map(mapApiPost);
        setPosts(mapped);
      }
    } catch (err) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, votes: p.votes - value } : p
        )
      );
      toast({
        title: "Vote failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedPostId) return;

    setSubmittingReply(true);

    const optimisticReply: Reply = {
      id: "temp-reply-" + Date.now(),
      postId: selectedPostId,
      content: replyContent.trim(),
      authorName: authorName,
      authorImage: null,
      votes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReplies((prev) => [...prev, optimisticReply]);
    setReplyContent("");

    try {
      const res = await fetch(`/api/community/${selectedPostId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticReply.content }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create reply: ${res.status}`);
      }

      const created: Reply = await res.json();
      setReplies((prev) =>
        prev.map((r) => (r.id === optimisticReply.id ? created : r))
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId ? { ...p, replies: p.replies + 1 } : p
        )
      );

      toast({
        title: "Reply posted!",
        description: "Your reply has been added.",
      });
    } catch (err) {
      setReplies((prev) => prev.filter((r) => r.id !== optimisticReply.id));
      toast({
        title: "Failed to post reply",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSubmitReplyTo = async (parentId: string) => {
    if (!replyToContent.trim() || !selectedPostId) return;

    setSubmittingReplyTo(true);

    const optimisticReply: Reply = {
      id: "temp-reply-" + Date.now(),
      postId: selectedPostId,
      content: replyToContent.trim(),
      authorName: authorName,
      authorImage: null,
      votes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
    };

    setReplies((prev) => [...prev, optimisticReply]);
    setReplyToContent("");
    setReplyingTo(null);

    try {
      const res = await fetch(`/api/community/${selectedPostId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticReply.content, parentId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create reply: ${res.status}`);
      }

      const created: Reply = await res.json();
      setReplies((prev) =>
        prev.map((r) => (r.id === optimisticReply.id ? created : r))
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId ? { ...p, replies: p.replies + 1 } : p
        )
      );

      toast({
        title: "Reply posted!",
        description: "Your reply has been added.",
      });
    } catch (err) {
      setReplies((prev) => prev.filter((r) => r.id !== optimisticReply.id));
      toast({
        title: "Failed to post reply",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReplyTo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const optimisticPost: Post = {
      id: "temp-" + Date.now(),
      title: title.trim(),
      body: body.trim(),
      author: authorName,
      avatar: "",
      replies: 0,
      votes: 0,
      views: 0,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      time: "Just now",
    };

    setPosts([optimisticPost, ...posts]);
    setTitle("");
    setBody("");
    setTagsInput("");
    setShowForm(false);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimisticPost.title,
          body: optimisticPost.body,
          tags: optimisticPost.tags,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);

      const created: ApiPost = await res.json();
      const mapped = mapApiPost(created);

      setPosts((prev) =>
        prev.map((p) => (p.id === optimisticPost.id ? mapped : p))
      );

      toast({
        title: "Post created!",
        description: "Your question has been posted to the community.",
      });
    } catch (err) {
      setPosts((prev) => prev.filter((p) => p.id !== optimisticPost.id));
      toast({
        title: "Failed to create post",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.body.toLowerCase().includes(term) ||
      post.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  const replyTree = buildReplyTree(replies);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// discussion</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-7 w-7" />
            community
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">ask questions. share what you know. help others.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <Input
              placeholder="search posts..."
              className="pl-9 pr-8 w-48 bg-[#0d0d0d] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-100"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button
            onClick={() => setShowForm((prev) => !prev)}
            className={showForm ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-[#c4f000] text-black hover:bg-[#b3d800]"}
          >
            <Plus className="h-4 w-4 mr-2" /> {showForm ? "cancel" : "new post"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="border border-rose-500/30 bg-rose-500/5 p-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">{error} — showing cached sample posts.</p>
        </div>
      )}

      {showForm && (
        <div className="border border-zinc-800/60 bg-[#0d0d0d]">
          <div className="p-4 border-b border-zinc-800/60">
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">// new thread</div>
            <h3 className="font-semibold mt-1">create a new post</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label htmlFor="title" className="block text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="what's your question?"
                required
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">body</label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="describe your question in detail..."
                rows={4}
                required
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">tags</label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="algebra, help (comma-separated)"
                className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            </div>
            <div className="flex items-center gap-3 py-2 border-y border-zinc-800/60">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">{authorInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-zinc-500">posting as <span className="font-medium text-zinc-100">{authorName}</span></span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-100">cancel</Button>
              <Button type="submit" className="bg-[#c4f000] text-black hover:bg-[#b3d800]">submit</Button>
            </div>
          </form>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); if (newTab === "top") loadTopPosts(); if (newTab === "unanswered") loadUnansweredPosts(); }} className="w-full">
        <TabsList className="bg-zinc-900/40 border border-zinc-800/60 p-1">
          <TabsTrigger value="recent" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">recent</TabsTrigger>
          <TabsTrigger value="top" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">top</TabsTrigger>
          <TabsTrigger value="unanswered" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">unanswered</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No posts yet</p>
                <p className="text-muted-foreground text-sm mt-1">Be the first to ask a question or share something!</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your search term</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((p) => (
              <PostCard key={p.id} post={p} onVote={handleVote} />
            ))
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-3">
          {loadingTop ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : topPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No top posts yet</p>
                <p className="text-muted-foreground text-sm mt-1">Posts with the most views will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            topPosts.map((p) => (
              <PostCard key={p.id} post={p} onVote={handleVote} />
            ))
          )}
        </TabsContent>

        <TabsContent value="unanswered" className="space-y-3">
          {loadingUnanswered ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : unansweredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground text-sm mt-1">No unanswered questions right now. Great job community!</p>
              </CardContent>
            </Card>
          ) : (
            unansweredPosts.map((p) => (
              <PostCard key={p.id} post={p} onVote={handleVote} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedPostId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {posts.find((p) => p.id === selectedPostId)?.title || "Post"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedPostId(null); setSearchTerm(""); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {posts.find((p) => p.id === selectedPostId)?.body || ""}
            </p>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3">
                Replies ({replies.length})
              </h3>

              {loadingReplies ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2 mb-3">
                    <div className="bg-muted rounded h-12 w-full" />
                  </div>
                ))
              ) : replies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No replies yet. Be the first to reply!
                </p>
              ) : (
                <ReplyTree
                  replies={replies.filter((r) => !r.parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())}
                  tree={replyTree}
                  depth={0}
                  onReplyTo={setReplyingTo}
                  replyingTo={replyingTo}
                  replyToContent={replyToContent}
                  onReplyToContentChange={setReplyToContent}
                  onSubmitReplyTo={handleSubmitReplyTo}
                  submittingReplyTo={submittingReplyTo}
                />
              )}
            </div>

            <form onSubmit={handleSubmitReply} className="border-t pt-4">
              <label htmlFor="reply" className="block text-sm font-medium mb-2">
                Write a reply
              </label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts or help answer this question..."
                rows={3}
                disabled={submittingReply}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setReplyContent("");
                    setSelectedPostId(null);
                  }}
                  disabled={submittingReply}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReply || !replyContent.trim()}>
                  {submittingReply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
