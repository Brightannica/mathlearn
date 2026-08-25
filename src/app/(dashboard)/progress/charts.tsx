"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StreakData } from "@/lib/streak";

function Charts({
  weeklyData,
  topicMastery,
  difficultyBreakdown,
  skills,
  streakData,
}: {
  weeklyData: { week: string; xp: number; lessons: number }[];
  topicMastery: { topic: string; mastery: number }[];
  difficultyBreakdown: { name: string; value: number; color: string }[];
  skills: { name: string; mastery: number; trend: string }[];
  streakData: StreakData | null;
}) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly XP</CardTitle>
            <CardDescription>Experience points earned per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topicMastery}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="mastery" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={difficultyBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {difficultyBreakdown.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="skills" className="space-y-3">
        {skills.map((s) => (
          <Card key={s.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{s.name}</span>
                <Badge variant={s.mastery >= 80 ? "default" : "secondary"}>{s.mastery}%</Badge>
              </div>
              <Progress value={s.mastery} className="mb-1" />
              <p className="text-xs text-green-600 dark:text-green-400">{s.trend} this month</p>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="breakdown">
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
            <CardDescription>Your learning activity over the past 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {streakData?.activeDates.slice(-84) || Array.from({ length: 84 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm bg-muted"
                  style={{
                    background: i % 5 > 1 ? `hsl(var(--primary) / ${0.3 + ((i % 7) / 10)})` : undefined,
                  }}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Darker squares = more activity
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default Charts;
