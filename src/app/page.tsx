"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, BookOpen, Trophy, BarChart3,
  ArrowRight, Star, Play, Users,
  LineChart, Target, FlaskConical,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen, title: "Structured Courses", desc: "Complete K–12 math curriculum organized by topic and difficulty.",
      gradient: "from-amber-600 to-orange-600",
    },
    {
      icon: Play, title: "Khan Academy Videos", desc: "High-quality video lessons embedded directly into your learning path.",
      gradient: "from-stone-600 to-stone-700",
    },
    {
      icon: Calculator, title: "Interactive Tools", desc: "Graphing calculator, matrix solver, unit converter, and more — right in your browser.",
      gradient: "from-emerald-600 to-teal-700",
    },
    {
      icon: BarChart3, title: "Progress Tracking", desc: "Detailed analytics and visualizations to track mastery over time.",
      gradient: "from-sky-700 to-blue-800",
    },
    {
      icon: Target, title: "Adaptive Practice", desc: "Spaced repetition and personalized quizzes help you master every topic.",
      gradient: "from-rose-600 to-pink-700",
    },
    {
      icon: Trophy, title: "Gamified Learning", desc: "Streaks, XP, badges, and leaderboards keep you motivated every single day.",
      gradient: "from-yellow-600 to-amber-700",
    },
  ];

  const grades = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  const testimonials = [
    { name: "Sarah K.", role: "8th Grade Student", text: "The structured courses helped me finally understand algebra. I went from failing to an A!", rating: 5 },
    { name: "Mr. Davis", role: "Middle School Teacher", text: "My students love the streaks and leaderboards. Engagement is way up.", rating: 5 },
    { name: "Miguel R.", role: "Parent", text: "Safe, COPPA-compliant, and my kid actually wants to do math now.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">MathLearn</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#grades" className="text-muted-foreground hover:text-foreground transition-colors">Grades</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Free Math Learning Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Master Math with{" "}
            <span className="bg-gradient-to-r from-primary via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Structured Courses
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Complete K–12 math curriculum with Khan Academy video lessons, interactive tools, and progress tracking.
            Learn at your own pace with a comprehensive courses hub designed for real understanding.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="shadow-lg shadow-primary/20">
              <Link href="/auth/signin">Start Learning Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features"><Play className="mr-2 h-4 w-4" /> See How It Works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Active Students", value: "50K+", icon: Users },
              { label: "Lessons", value: "500+", icon: BookOpen },
              { label: "Practice Problems", value: "10K+", icon: Target },
              { label: "Avg. Grade Boost", value: "+1.5", icon: LineChart },
            ].map((s) => {
              const IconComponent = s.icon;
              return (
                <Card key={s.label} className="border-0 bg-background/80 backdrop-blur-sm shadow-sm">
                  <CardContent className="pt-5 text-center">
                    <IconComponent className="h-4 w-4 mx-auto text-primary mb-2" />
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to learn math</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A complete platform combining quality content with effective learning tools.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const IconComponent = f.icon;
              return (
                <Card key={f.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-10 transition-all group-hover:scale-150`} />
                  <CardContent className="pt-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} text-white shadow-sm`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-semibold text-base">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Khan Academy Showcase */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn from the best</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              High-quality video lessons from Khan Academy embedded directly in your learning journey
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Introduction to Fractions",
                videoId: "j4lwozSU0XQ",
                description: "Learn the basics of fractions with visual models",
                grade: "Grade 3",
              },
              {
                title: "Solving Linear Equations",
                videoId: "XAQgByKkAGI",
                description: "Master solving equations step by step",
                grade: "Grade 8",
              },
              {
                title: "Quadratic Formula",
                videoId: "HNw1I-8qkLQ",
                description: "Solve any quadratic equation using the formula",
                grade: "Grade 9",
              },
            ].map((video, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <Image
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                     fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{video.grade}</Badge>
                    <Badge variant="outline" className="text-xs">Khan Academy</Badge>
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/learn">
                Explore All Lessons <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Tools Preview */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Interactive Math Tools</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Visualize concepts with our built-in calculators and explorers
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Graphing Calculator", icon: Calculator, desc: "Plot functions visually", color: "from-amber-600 to-orange-600" },
              { name: "Quadratic Explorer", icon: FlaskConical, desc: "Adjust coefficients in real-time", color: "from-stone-600 to-stone-700" },
              { name: "Probability Lab", icon: Target, desc: "Coin flip simulations", color: "from-emerald-600 to-teal-700" },
              { name: "Matrix Solver", icon: BarChart3, desc: "Determinants & operations", color: "from-sky-700 to-blue-800" },
            ].map((tool, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardContent className="pt-5 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/tools">
                Try All Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Grades */}
      <section id="grades" className="px-4 py-20">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for every grade</h2>
          <p className="mt-4 text-muted-foreground">From counting to calculus — we cover it all.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {grades.map((g) => (
              <div
                key={g}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-base font-bold text-primary border border-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl mb-10">Loved by students & teachers</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="pt-5">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-sm text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary via-amber-600 to-orange-700 text-white shadow-xl">
            <CardContent className="pt-9 pb-9 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to love math?</h2>
              <p className="mt-4 text-white/90 max-w-xl mx-auto">
                Join thousands of students learning with our structured courses. Free to start, no credit card required.
              </p>
              <Button size="lg" variant="secondary" className="mt-6 shadow-lg" asChild>
                <Link href="/auth/signin">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">MathLearn</span>
          </div>
          <p>&copy; 2026 MathLearn. All rights reserved.</p>
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
