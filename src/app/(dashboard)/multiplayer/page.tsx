"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Zap, Users, Clock, Play, Crown, Target, Swords, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

type GameRoom = {
  id: string;
  name: string;
  host: string;
  hostAvatar: string;
  players: number;
  maxPlayers: number;
  topic: string;
  difficulty: string;
  timeLimit: number;
  status: "waiting" | "in_progress" | "finished";
  isPrivate: boolean;
};

type ActiveGame = {
  id: string;
  name: string;
  players: { name: string; avatar: string; score: number; isYou: boolean }[];
  topic: string;
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
};

const mockRooms: GameRoom[] = [
  { id: "1", name: "Algebra Showdown", host: "Emma W.", hostAvatar: "", players: 3, maxPlayers: 4, topic: "Algebra", difficulty: "Medium", timeLimit: 300, status: "waiting", isPrivate: false },
  { id: "2", name: "Geometry Masters", host: "Liam C.", hostAvatar: "", players: 2, maxPlayers: 6, topic: "Geometry", difficulty: "Hard", timeLimit: 600, status: "waiting", isPrivate: false },
  { id: "3", name: "Speed Math Challenge", host: "Sofia M.", hostAvatar: "", players: 5, maxPlayers: 8, topic: "Mixed", difficulty: "Easy", timeLimit: 180, status: "in_progress", isPrivate: false },
  { id: "4", name: "Calculus Duel", host: "Noah B.", hostAvatar: "", players: 1, maxPlayers: 2, topic: "Calculus", difficulty: "Hard", timeLimit: 420, status: "waiting", isPrivate: true },
  { id: "5", name: "Fraction Frenzy", host: "Ava P.", hostAvatar: "", players: 4, maxPlayers: 4, topic: "Fractions", difficulty: "Easy", timeLimit: 240, status: "in_progress", isPrivate: false },
];

const mockActiveGame: ActiveGame = {
  id: "g1",
  name: "Algebra Showdown",
  players: [
    { name: "You", avatar: "", score: 850, isYou: true },
    { name: "Emma W.", avatar: "", score: 920, isYou: false },
    { name: "Liam C.", avatar: "", score: 780, isYou: false },
  ],
  topic: "Algebra",
  timeLeft: 145,
  currentQuestion: 7,
  totalQuestions: 10,
};

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-600 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function MultiplayerPage() {
  const [activeTab, setActiveTab] = useState("rooms");
  const [joinedRoom, setJoinedRoom] = useState<ActiveGame | null>(null);

  const handleJoinRoom = (room: GameRoom) => {
    if (room.status === "waiting" && room.players < room.maxPlayers) {
      setJoinedRoom(mockActiveGame);
      setActiveTab("active");
    }
  };

  const handleCreateRoom = () => {
    setJoinedRoom(mockActiveGame);
    setActiveTab("active");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Swords className="h-8 w-8 text-primary" /> Multiplayer
          </h1>
          <p className="text-muted-foreground mt-1">Compete with friends in real-time math challenges</p>
        </div>
        <Button onClick={handleCreateRoom}>
          <Play className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="rooms">Game Rooms</TabsTrigger>
          <TabsTrigger value="active">Active Game</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockRooms.map((room) => (
              <Card key={room.id} className={cn("transition-all hover:shadow-md", room.status === "in_progress" && "opacity-75")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {room.name}
                      {room.isPrivate && <Badge variant="secondary" className="text-xs">Private</Badge>}
                    </CardTitle>
                    <Badge variant={room.status === "waiting" ? "default" : "secondary"} className="text-xs">
                      {room.status === "waiting" ? "Waiting" : "In Progress"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{room.host[0]}</AvatarFallback>
                    </Avatar>
                    Hosted by {room.host}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {room.players}/{room.maxPlayers}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {Math.floor(room.timeLimit / 60)}m
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {room.topic}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("text-xs", difficultyColors[room.difficulty as keyof typeof difficultyColors])}>
                      {room.difficulty}
                    </Badge>
                    <Button
                      size="sm"
                      variant={room.status === "waiting" && room.players < room.maxPlayers ? "default" : "secondary"}
                      disabled={room.status !== "waiting" || room.players >= room.maxPlayers}
                      onClick={() => handleJoinRoom(room)}
                    >
                      {room.status === "waiting" ? (room.players >= room.maxPlayers ? "Full" : "Join") : "Spectate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          {joinedRoom ? (
            <>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{joinedRoom.name}</CardTitle>
                      <CardDescription>{joinedRoom.topic} · Question {joinedRoom.currentQuestion}/{joinedRoom.totalQuestions}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.floor(joinedRoom.timeLeft / 60)}:{(joinedRoom.timeLeft % 60).toString().padStart(2, "0")}</p>
                      <p className="text-xs text-muted-foreground">Time Left</p>
                    </div>
                  </div>
                  <Progress value={(joinedRoom.currentQuestion / joinedRoom.totalQuestions) * 100} className="h-2" />
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                {joinedRoom.players.map((player, idx) => (
                  <Card key={player.name} className={cn(player.isYou && "border-primary bg-primary/5")}>
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{player.name[0]}</AvatarFallback>
                        </Avatar>
                        {idx === 0 && <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500" />}
                      </div>
                      <p className="font-semibold mt-3">{player.name}</p>
                      <p className="text-2xl font-bold text-primary mt-1">{player.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Question {joinedRoom.currentQuestion}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-xl font-semibold">Solve for x: 2x + 5 = 13</p>
                    <p className="text-muted-foreground mt-2">Type your answer below</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex-1 h-14 text-lg font-semibold">A) x = 3</Button>
                    <Button variant="outline" className="flex-1 h-14 text-lg font-semibold">B) x = 4</Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex-1 h-14 text-lg font-semibold">C) x = 5</Button>
                    <Button variant="outline" className="flex-1 h-14 text-lg font-semibold">D) x = 6</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium">No active game</p>
                <p className="text-muted-foreground text-sm mt-1">Join a room or create a new one to start playing!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-primary" />
                    Multiplayer Rankings
                  </CardTitle>
                </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Emma W.", wins: 42, winRate: 89, xp: 8420 },
                  { rank: 2, name: "Liam C.", wins: 38, winRate: 85, xp: 7980 },
                  { rank: 3, name: "Sofia M.", wins: 35, winRate: 82, xp: 7510 },
                  { rank: 4, name: "Noah B.", wins: 31, winRate: 78, xp: 7120 },
                  { rank: 5, name: "Ava P.", wins: 28, winRate: 75, xp: 6890 },
                ].map((player) => (
                  <div key={player.rank} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm",
                      player.rank <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {player.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.wins} wins · {player.winRate}% win rate</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        {player.xp.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
