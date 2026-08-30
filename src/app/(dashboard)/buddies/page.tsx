"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, MessageCircle, UserPlus, Zap, Flame, Trophy,
  Target, Star, CheckCircle2, X, Filter, RefreshCw, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getState, subscribe } from "@/lib/local-state";
import { getPerformance, getOverallStats } from "@/lib/adaptive-difficulty";

type Buddy = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  xp: number;
  streak: number;
  accuracy: number;
  topics: string[];
  status: "online" | "offline" | "in_game";
  mutualFriends: number;
  isYou?: boolean;
};

const MOCK_BUDDIES: Buddy[] = [
  { id: "1", name: "Emma W.", avatar: "", grade: "8", xp: 5420, streak: 21, accuracy: 0.89, topics: ["algebra", "geometry"], status: "online", mutualFriends: 12 },
  { id: "2", name: "Liam C.", avatar: "", grade: "10", xp: 4980, streak: 14, accuracy: 0.85, topics: ["calculus", "algebra"], status: "in_game", mutualFriends: 8 },
  { id: "3", name: "Sofia M.", avatar: "", grade: "6", xp: 4510, streak: 9, accuracy: 0.92, topics: ["arithmetic", "fractions"], status: "online", mutualFriends: 15 },
  { id: "4", name: "Noah B.", avatar: "", grade: "9", xp: 4120, streak: 7, accuracy: 0.78, topics: ["geometry", "statistics"], status: "offline", mutualFriends: 5 },
  { id: "5", name: "Ava P.", avatar: "", grade: "7", xp: 3890, streak: 12, accuracy: 0.88, topics: ["algebra", "arithmetic"], status: "online", mutualFriends: 9 },
  { id: "6", name: "Oliver H.", avatar: "", grade: "11", xp: 2940, streak: 5, accuracy: 0.82, topics: ["calculus", "trigonometry"], status: "offline", mutualFriends: 3 },
  { id: "7", name: "Mia S.", avatar: "", grade: "5", xp: 2710, streak: 3, accuracy: 0.95, topics: ["arithmetic", "fractions"], status: "online", mutualFriends: 7 },
  { id: "8", name: "James K.", avatar: "", grade: "8", xp: 3200, streak: 8, accuracy: 0.84, topics: ["algebra", "geometry"], status: "in_game", mutualFriends: 4 },
  { id: "9", name: "Charlotte L.", avatar: "", grade: "10", xp: 3650, streak: 11, accuracy: 0.91, topics: ["statistics", "probability"], status: "online", mutualFriends: 6 },
  { id: "10", name: "Benjamin T.", avatar: "", grade: "9", xp: 2800, streak: 6, accuracy: 0.79, topics: ["geometry", "trigonometry"], status: "offline", mutualFriends: 2 },
  { id: "11", name: "Amelia R.", avatar: "", grade: "7", xp: 3100, streak: 10, accuracy: 0.87, topics: ["algebra", "statistics"], status: "online", mutualFriends: 11 },
  { id: "12", name: "Lucas G.", avatar: "", grade: "12", xp: 4200, streak: 15, accuracy: 0.93, topics: ["calculus", "linear algebra"], status: "in_game", mutualFriends: 8 },
];

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  in_game: "bg-purple-500",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
  in_game: "In Game",
};

export default function StudyBuddiesPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "in_game">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [requests, setRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  const state = getState();
  const overall = getOverallStats();
  const perf = getPerformance();
  void tick;

  const userName = "You";
  const userXp = state.xp || 3180;
  const userGrade = "9";
  const userStreak = state.streak || 0;
  const userAccuracy = overall.totalAttempts > 0 ? Math.round(overall.overallAccuracy * 100) : 0;
  const userTopics = Object.keys(perf).slice(0, 3);

  const filteredBuddies = useMemo(() => {
    return MOCK_BUDDIES.filter((b) => {
      if (searchTerm.trim() && !b.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (gradeFilter !== "all" && b.grade !== gradeFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (topicFilter !== "all" && !b.topics.includes(topicFilter)) return false;
      return true;
    });
  }, [searchTerm, gradeFilter, statusFilter, topicFilter]);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    MOCK_BUDDIES.forEach((b) => b.topics.forEach((t) => topics.add(t)));
    return Array.from(topics).sort();
  }, []);

  const handleAddFriend = (buddyId: string) => {
    setRequests((prev) => new Set([...prev, buddyId]));
    toast({ title: "friend request sent", description: "they'll see it next time they log in" });
  };

  const handleRemoveFriend = (buddyId: string) => {
    setFriends((prev) => {
      const next = new Set(prev);
      next.delete(buddyId);
      return next;
    });
    toast({ title: "friend removed" });
  };

  const handleAcceptRequest = (buddyId: string) => {
    setRequests((prev) => {
      const next = new Set(prev);
      next.delete(buddyId);
      return next;
    });
    setFriends((prev) => new Set([...prev, buddyId]));
    toast({ title: "friend added!", description: "you can now challenge them" });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// find your crew</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            study buddies
          </h1>
          <p className="text-muted-foreground mt-1">connect with other learners and compete together</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
            {MOCK_BUDDIES.filter((b) => b.status === "online").length} online
          </Badge>
        </div>
      </div>

      {/* Your profile card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-orange-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">Y</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {userName}
                {userXp >= 5000 && <Crown className="h-5 w-5 text-yellow-500" />}
              </h2>
              <p className="text-muted-foreground">Grade {userGrade} · {userXp.toLocaleString()} XP · {userStreak} day streak</p>
              <div className="flex gap-2 mt-2">
                {userTopics.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs capitalize">{t}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userXp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{userStreak}</div>
                <div className="text-xs text-muted-foreground">streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{userAccuracy}%</div>
                <div className="text-xs text-muted-foreground">accuracy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="search buddies..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input text-sm"
          >
            <option value="all">all grades</option>
            {["5", "6", "7", "8", "9", "10", "11", "12"].map((g) => (
              <option key={g} value={g}>grade {g}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 bg-background border border-input text-sm"
          >
            <option value="all">all status</option>
            <option value="online">online</option>
            <option value="in_game">in game</option>
            <option value="offline">offline</option>
          </select>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input text-sm"
          >
            <option value="all">all topics</option>
            {allTopics.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buddy list */}
      <div className="grid gap-3">
        {filteredBuddies.map((buddy) => {
          const isFriend = friends.has(buddy.id);
          const isRequested = requests.has(buddy.id);
          return (
            <Card key={buddy.id} className={cn("transition-all hover:shadow-md", buddy.isYou && "border-primary bg-primary/5")}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{buddy.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background", statusColors[buddy.status])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{buddy.name}</p>
                      {buddy.xp >= 5000 && <Crown className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">Grade {buddy.grade}</Badge>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{buddy.xp.toLocaleString()} XP</span>
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{buddy.streak}d</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{buddy.mutualFriends} mutual friends</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{Math.round(buddy.accuracy * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFriend ? (
                      <>
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Chat
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFriend(buddy.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : isRequested ? (
                      <Badge variant="secondary" className="text-xs">requested</Badge>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleAddFriend(buddy.id)}>
                          <UserPlus className="h-3 w-3" />
                          Add
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Chat
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBuddies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">no buddies found</p>
            <p className="text-sm text-muted-foreground mt-1">try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
