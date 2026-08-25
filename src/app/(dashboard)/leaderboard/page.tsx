"use client";

import { useState, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Trophy, Zap, Crown, Medal, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/use-supabase-data";

type Student = {
  rank: number;
  name: string;
  grade: string;
  xp: number;
  streak: number;
  avatar: string;
  isYou?: boolean;
  top?: boolean;
  weeklyXP?: number;
};

const sampleStudents: Student[] = [
  { rank: 1, name: "Emma W.", grade: "8", xp: 5420, streak: 21, avatar: "", top: true, weeklyXP: 420 },
  { rank: 2, name: "Liam C.", grade: "10", xp: 4980, streak: 14, avatar: "", weeklyXP: 380 },
  { rank: 3, name: "Sofia M.", grade: "6", xp: 4510, streak: 9, avatar: "", weeklyXP: 350 },
  { rank: 4, name: "Noah B.", grade: "9", xp: 4120, streak: 7, avatar: "", weeklyXP: 290 },
  { rank: 5, name: "Ava P.", grade: "7", xp: 3890, streak: 12, avatar: "", weeklyXP: 260 },
  { rank: 6, name: "Oliver H.", grade: "11", xp: 2940, streak: 5, avatar: "", weeklyXP: 180 },
  { rank: 7, name: "Mia S.", grade: "5", xp: 2710, streak: 3, avatar: "", weeklyXP: 150 },
];

const weeklyStudents: Student[] = [
  { rank: 1, name: "Emma W.", grade: "8", xp: 420, streak: 21, avatar: "", top: true },
  { rank: 2, name: "Liam C.", grade: "10", xp: 380, streak: 14, avatar: "" },
  { rank: 3, name: "Sofia M.", grade: "6", xp: 350, streak: 9, avatar: "" },
  { rank: 4, name: "Noah B.", grade: "9", xp: 290, streak: 7, avatar: "" },
  { rank: 5, name: "Ava P.", grade: "7", xp: 260, streak: 12, avatar: "" },
];

const TopCard = memo(function TopCard({ rank, name, xp, icon, gradient, border }: { rank: number; name: string; xp: number; icon: React.ReactNode; gradient: string; border: string }) {
  return (
    <Card className={cn("relative overflow-hidden bg-gradient-to-br border-2", gradient, border)}>
      <CardContent className="pt-6 text-center">
        <div className="absolute top-2 right-2">{icon}</div>
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          #{rank}
        </div>
        <p className="font-bold text-lg">{name}</p>
        <p className="text-sm text-muted-foreground">{xp.toLocaleString()} XP</p>
      </CardContent>
    </Card>
  );
});
TopCard.displayName = "TopCard";

const StudentCard = memo(function StudentCard({
  student
}: {
  student: Student;
}) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        student.isYou && "border-primary bg-primary/5",
        student.top && "border-yellow-500/30"
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold",
            student.rank <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {student.rank}
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{student.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{student.name}{student.isYou && <span className="text-primary"> (You)</span>}</p>
            <Badge variant="outline" className="text-xs mt-0.5">Grade {student.grade}</Badge>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" />{student.streak}</span>
          </div>
          <div className="text-right">
            <p className="font-bold flex items-center justify-end gap-1">
              <Zap className="h-4 w-4 text-primary" />{student.xp.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
StudentCard.displayName = "StudentCard";

export default function LeaderboardPage() {
  const { stats, loading } = useDashboardData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const currentUser: Student | null = stats
    ? {
        rank: 6,
        name: "You",
        grade: "9",
        xp: stats.totalXP,
        streak: stats.currentStreak,
        avatar: "",
        isYou: true,
        weeklyXP: Math.round(stats.totalXP * 0.05),
      }
    : null;

  const globalStudents: Student[] = currentUser
    ? [...sampleStudents, currentUser].sort((a, b) => b.xp - a.xp).map((s, i) => ({ ...s, rank: i + 1 }))
    : sampleStudents;

  const gradeFiltered = selectedGrade === "all"
    ? globalStudents
    : globalStudents.filter((s) => s.grade === selectedGrade).map((s, i) => ({ ...s, rank: i + 1 }));

  const weeklyRanked = [...weeklyStudents, ...(currentUser ? [currentUser] : [])]
    .sort((a, b) => (b.weeklyXP ?? 0) - (a.weeklyXP ?? 0))
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">See how you rank among fellow learners</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <TopCard rank={1} name={globalStudents[0]?.name ?? "Emma W."} xp={globalStudents[0]?.xp ?? 5420} icon={<Trophy className="h-6 w-6 text-yellow-500" />} gradient="from-yellow-400/20 to-yellow-500/5" border="border-yellow-500/40" />
          <TopCard rank={2} name={globalStudents[1]?.name ?? "Liam C."} xp={globalStudents[1]?.xp ?? 4980} icon={<Medal className="h-6 w-6 text-slate-400" />} gradient="from-slate-400/20 to-slate-500/5" border="border-slate-400/40" />
          <TopCard rank={3} name={globalStudents[2]?.name ?? "Sofia M."} xp={globalStudents[2]?.xp ?? 4510} icon={<Medal className="h-6 w-6 text-amber-700" />} gradient="from-amber-700/20 to-amber-900/5" border="border-amber-700/40" />
        </div>
      )}

      <Tabs defaultValue="global" className="w-full">
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="grade">By Grade</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-2">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading your stats...</p>
              </CardContent>
            </Card>
          ) : (
            globalStudents.map((s) => (
              <StudentCard key={`${s.rank}-${refreshKey}`} student={s} />
            ))
          )}
        </TabsContent>

        <TabsContent value="grade" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>Grade {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {gradeFiltered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No students found for this grade.
              </CardContent>
            </Card>
          ) : (
            gradeFiltered.map((s) => (
              <StudentCard key={`${s.rank}-${refreshKey}-${selectedGrade}`} student={s} />
            ))
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-2">
          {weeklyRanked.map((s) => (
            <StudentCard key={`weekly-${s.rank}-${refreshKey}`} student={s} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
