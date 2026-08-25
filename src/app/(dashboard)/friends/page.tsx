"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, MessageCircle, Search, Check, X, Crown, Flame, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  xp: number;
  streak: number;
  status: "online" | "offline" | "in_game";
  mutualFriends: number;
};

type FriendRequest = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  xp: number;
  mutualFriends: number;
  sentAt: string;
};

const mockFriends: Friend[] = [
  { id: "1", name: "Emma W.", avatar: "", grade: "8", xp: 5420, streak: 21, status: "online", mutualFriends: 12 },
  { id: "2", name: "Liam C.", avatar: "", grade: "10", xp: 4980, streak: 14, status: "in_game", mutualFriends: 8 },
  { id: "3", name: "Sofia M.", avatar: "", grade: "6", xp: 4510, streak: 9, status: "online", mutualFriends: 15 },
  { id: "4", name: "Noah B.", avatar: "", grade: "9", xp: 4120, streak: 7, status: "offline", mutualFriends: 5 },
  { id: "5", name: "Ava P.", avatar: "", grade: "7", xp: 3890, streak: 12, status: "online", mutualFriends: 9 },
  { id: "6", name: "Oliver H.", avatar: "", grade: "11", xp: 2940, streak: 5, status: "offline", mutualFriends: 3 },
];

const mockRequests: FriendRequest[] = [
  { id: "r1", name: "Mia S.", avatar: "", grade: "5", xp: 2710, mutualFriends: 4, sentAt: "2h ago" },
  { id: "r2", name: "James K.", avatar: "", grade: "8", xp: 3200, mutualFriends: 7, sentAt: "5h ago" },
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

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState(mockFriends);
  const [requests, setRequests] = useState(mockRequests);

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    const term = searchTerm.trim().toLowerCase();
    return friends.filter(f => f.name.toLowerCase().includes(term));
  }, [friends, searchTerm]);

  const onlineFriends = useMemo(() => filteredFriends.filter(f => f.status === "online" || f.status === "in_game"), [filteredFriends]);

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setFriends(prev => [...prev, {
        id: request.id,
        name: request.name,
        avatar: request.avatar,
        grade: request.grade,
        xp: request.xp,
        streak: 0,
        status: "online",
        mutualFriends: request.mutualFriends,
      }]);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Friends
          </h1>
          <p className="text-muted-foreground mt-1">Connect with other learners and compete together</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
            {onlineFriends.length} online
          </Badge>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({onlineFriends.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredFriends.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No friends found</p>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or add new friends!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="transition-all hover:shadow-md">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background", statusColors[friend.status])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{friend.name}</p>
                          {friend.xp >= 5000 && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">Grade {friend.grade}</Badge>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{friend.xp.toLocaleString()} XP</span>
                          <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{friend.streak} days</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{friend.mutualFriends} mutual friends</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <div className={cn("h-1.5 w-1.5 rounded-full mr-1.5", statusColors[friend.status])} />
                          {statusLabels[friend.status]}
                        </Badge>
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Chat
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFriend(friend.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="online" className="space-y-4 mt-4">
          <div className="grid gap-3">
            {onlineFriends.map((friend) => (
              <Card key={friend.id} className="transition-all hover:shadow-md">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background", statusColors[friend.status])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{friend.name}</p>
                        {friend.xp >= 5000 && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">Grade {friend.grade}</Badge>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{friend.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </Button>
                      <Button variant="default" size="sm">
                        Challenge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No pending requests</p>
                <p className="text-muted-foreground text-sm mt-1">When someone sends you a friend request, it will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {requests.map((request) => (
                <Card key={request.id} className="transition-all hover:shadow-md">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{request.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{request.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">Grade {request.grade}</Badge>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{request.xp.toLocaleString()} XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{request.mutualFriends} mutual friends · {request.sentAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" className="gap-1" onClick={() => handleAcceptRequest(request.id)}>
                          <Check className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleRejectRequest(request.id)}>
                          <X className="h-3 w-3" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
