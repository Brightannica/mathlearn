"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Terminal, Activity, GitBranch, Zap, Hash,
  Layers, Cpu, Command, ChevronRight, Square, CheckCircle2,
  ArrowDown, Play, BookOpen, Target, Code2, Trophy, Sparkles,
} from "lucide-react";

function useTypingEffect(text: string, speed = 40, delay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

function ProblemDemo() {
  const problemText = "Solve for x:\n3(x + 2) − 4 = 2x + 7";
  const userAttempt = "3x + 6 − 4 = 2x + 7\n3x + 2 = 2x + 7\nx = 5";
  const resultText = "✓ correct  ·  +15 XP  ·  streak: 7 days";
  const { displayed: p1 } = useTypingEffect(problemText, 20, 500);
  const { displayed: p2, done: d2 } = useTypingEffect(userAttempt, 18, 3500);
  const { displayed: p3, done: d3 } = useTypingEffect(resultText, 25, 7500);

  return (
    <div className="border border-zinc-800 bg-[#0a0a0a] shadow-2xl shadow-[#c4f000]/5 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-1.5">
          <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
          <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
          <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">session.k — algebra</span>
        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          live
        </div>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed space-y-3 min-h-[320px]">
        <div className="text-zinc-600">$ mathitout solve --topic linear-equations</div>
        <div className="text-[#c4f000]">→ problem 7 of 10  ·  ~2 min</div>

        <div className="text-zinc-300 mt-4 whitespace-pre-wrap">{p1}<span className={p1.length < problemText.length ? "animate-pulse text-zinc-500" : ""}>▌</span></div>

        {p1.length >= problemText.length && (
          <div className="bg-zinc-900/60 border-l-2 border-[#c4f000] px-3 py-2 mt-3 text-zinc-100 whitespace-pre-wrap">
            {p2}
            {!d2 && <span className="animate-pulse text-zinc-500">▌</span>}
          </div>
        )}

        {d2 && (
          <div className={`text-[#c4f000] mt-2 transition-opacity duration-300 ${d2 ? "opacity-100" : "opacity-0"}`}>
            {p3}
          </div>
        )}

        {d3 && (
          <div className="text-zinc-600 text-xs mt-4 flex items-center gap-2">
            <span>$</span>
            <span className="animate-pulse">_</span>
            <span className="text-zinc-700 ml-2">next: problem 8 →</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({
  icon, title, grade, lessons, color, delay,
}: { icon: string; title: string; grade: string; lessons: number; color: string; delay: number }) {
  return (
    <div
      className="group border border-zinc-800/60 bg-[#0d0d0d] p-5 hover:border-zinc-600 transition-all duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2 mb-3"
        style={{ borderColor: color, color }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-100 group-hover:text-[#c4f000] transition-colors">{title}</h3>
      <p className="text-xs text-zinc-500 mt-0.5">grade {grade} · {lessons} lessons</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-mono selection:bg-[#c4f000] selection:text-black">
      {/* Top status bar */}
      <div className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4f000] animate-pulse" />
              all systems operational
            </span>
            <span className="hidden sm:inline text-zinc-700">//</span>
            <span className="hidden sm:inline">2,847 students practicing right now</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-600">
            <span>k–12</span>
            <span>·</span>
            <span>free, no card</span>
            <span>·</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="border-b border-zinc-800/60 bg-[#0a0a0a] sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-[#c4f000] flex items-center justify-center group-hover:rotate-3 transition-transform">
              <span className="text-black font-bold text-sm">m</span>
            </div>
            <span className="font-semibold text-base tracking-tight">mathitout</span>
            <span className="text-zinc-600 text-xs hidden sm:inline">// figure it out, properly</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="#features" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">features</Link>
            <Link href="#how" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:inline">how it works</Link>
            <Link href="#courses" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors hidden md:inline">courses</Link>
            <div className="w-px h-5 bg-zinc-800 mx-2" />
            <Link href="/auth/signin" className="px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 transition-colors">sign in</Link>
            <Button asChild size="sm" className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-medium ml-1">
              <Link href="/auth/signup">get started <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,240,0,0.10),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(96,165,250,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f000] animate-pulse" />
                <span>now in public beta</span>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-500">v0.1.0</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.92]">
                <span className="text-zinc-100">stop watching</span>
                <br />
                <span className="text-zinc-500">math tutorials.</span>
                <br />
                <span className="text-[#c4f000]">start solving.</span>
              </h1>

              <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                A practice-first math app. Pick a topic, get a problem, write your working, get it checked.
                No streaks-as-a-substitute-for-actual-learning. No confetti when you guess right.
                Just problems, and you getting better at them.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-12 px-6 group">
                  <Link href="/auth/signup">
                    start practicing
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700 h-12 px-6">
                  <Link href="#demo">
                    <Play className="mr-2 h-4 w-4" /> see it in action
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800/60 border border-zinc-800/60">
                {[
                  { k: "courses", v: "9" },
                  { k: "lessons", v: "30+" },
                  { k: "problems", v: "60+" },
                  { k: "price", v: "$0" },
                ].map((s) => (
                  <div key={s.k} className="bg-[#0a0a0a] p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">{s.k}</div>
                    <div className="text-2xl font-semibold mt-1 text-zinc-100">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5" id="demo">
              <ProblemDemo />
              <div className="mt-3 px-1 flex items-center gap-2 text-xs text-zinc-600 font-mono">
                <span className="h-1 w-1 rounded-full bg-[#c4f000] animate-pulse" />
                <span>live demo · auto-playing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>COPPA compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>No ads, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>No data sold</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Keyboard-first</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// what you get</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              mathitout<span className="text-zinc-600">.features</span>
            </h2>
            <p className="text-zinc-400 mt-4 text-lg">Six things. No more, no less. Each one does one job well.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
            {[
              { icon: Layers, k: "01", t: "Structured courses", d: "K through AP Calc. 5 courses, 14 lessons, each one building on the last. No scattered playlists.", c: "[courses]" },
              { icon: Code2, k: "02", t: "LeetCode-style solver", d: "18+ problems with in-browser code runner. Write actual JavaScript, pass real test cases, earn XP.", c: "[solve]" },
              { icon: Activity, k: "03", t: "Weakness map", d: "See exactly which sub-skill is costing you points. Drill that. Skip what you know.", c: "[analyze]" },
              { icon: GitBranch, k: "04", t: "Step-by-step grading", d: "Not just final answer. Each step is checked. Partial credit when you've earned it.", c: "[grade]" },
              { icon: Hash, k: "05", t: "Spaced repetition", d: "Problems resurface right before you'd forget them. Long-term memory, not cramming.", c: "[review]" },
              { icon: Command, k: "06", t: "Keyboard-first", d: "Type your answer. Tab between fields. Cmd+K to jump anywhere. No mouse, no friction.", c: "[cmd+k]" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.k} className="bg-[#0a0a0a] p-7 group hover:bg-[#0f0f0f] transition-colors relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className="p-2.5 bg-[#c4f000]/10 border border-[#c4f000]/20 group-hover:bg-[#c4f000]/15 transition-colors">
                      <Icon className="h-5 w-5 text-[#c4f000]" />
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-wider">{f.c}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mb-1 font-mono">{f.k}</div>
                  <div className="text-lg font-semibold text-zinc-100 mb-2">{f.t}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{f.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// the loop</div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">How practice actually works.</h2>
              <p className="text-zinc-400 leading-relaxed mb-10 text-lg">
                Most math apps optimize for "engagement" — keeping you clicking.
                We optimize for the one thing that matters: you understanding the next problem.
              </p>
              <div className="space-y-4">
                {[
                  { t: "You see a problem, not a video about a problem.", d: "No 8-minute intro. No ads. Just the question." },
                  { t: "You write your working. We check each step.", d: "Full solutions, not just final answers. Step-by-step grading." },
                  { t: "When you're wrong, we tell you exactly which step, and why.", d: "Specific feedback, not a red X. " },
                  { t: "Tomorrow, similar problems resurface — calibrated to your forgetting curve.", d: "Spaced repetition so it actually sticks." },
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#c4f000]/30 bg-[#c4f000]/5 text-[#c4f000] text-xs font-mono group-hover:bg-[#c4f000]/10 transition-colors">
                      0{i + 1}
                    </div>
                    <div>
                      <div className="text-zinc-200 font-medium">{line.t}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{line.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button asChild className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-11">
                  <Link href="/auth/signup">try it <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-zinc-800 bg-[#0a0a0a]">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500 flex items-center gap-2">
                  <Terminal className="h-3 w-3" />
                  weakness-report.json
                </div>
                <pre className="p-5 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "student": "you",
  "period": "last_30_days",
  "weak_skills": [
    {
      "topic": "algebra.quadratic.foil",
      "accuracy": 0.42,
      "attempts": 24,
      "drill_ready": true,
      "next_review": "2026-08-26"
    },
    {
      "topic": "geometry.circles.arcs",
      "accuracy": 0.58,
      "attempts": 19,
      "drill_ready": true
    }
  ],
  "strong_skills": [
    "arithmetic.fractions",
    "algebra.linear.basic"
  ],
  "verdict": "ship 2 drills, skip 4"
}`}
                </pre>
              </div>

              <div className="border border-zinc-800 bg-[#0a0a0a] p-4">
                <div className="text-xs text-zinc-500 mb-3">// today's session</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">3(x + 2) − 4 = 2x + 7</span>
                    <span className="text-emerald-400 text-xs">✓ 15 XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">5² + 12² = ?</span>
                    <span className="text-emerald-400 text-xs">✓ 10 XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">d/dx[sin(x²)]</span>
                    <span className="text-amber-400 text-xs">→ hint given</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">mean([2,4,4,4,5,5,7,9])</span>
                    <span className="text-emerald-400 text-xs">✓ 25 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// curriculum</div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">K to 12. Pre-alg to AP Calc.</h2>
              <p className="text-zinc-400 mt-3 text-lg">Each course is a real sequence. Not a pile of unrelated videos.</p>
            </div>
            <Button asChild variant="outline" className="border-zinc-800 hover:border-zinc-700 hidden sm:flex">
              <Link href="/learn">all courses <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: "ƒ", title: "Algebra I", grade: "8–9", lessons: 6, color: "#c4f000" },
              { icon: "△", title: "Geometry", grade: "7–10", lessons: 4, color: "#60a5fa" },
              { icon: "∑", title: "Arithmetic", grade: "5–7", lessons: 4, color: "#fbbf24" },
              { icon: "σ", title: "Statistics", grade: "9–12", lessons: 2, color: "#a78bfa" },
              { icon: "∫", title: "Calculus", grade: "11–12", lessons: 2, color: "#f472b6" },
            ].map((course, i) => (
              <CourseCard key={course.title} {...course} delay={i * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// what people say</div>
            <h2 className="text-4xl font-bold tracking-tight">honest reviews</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { n: "Sarah K.", r: "8th grader", q: "went from failing algebra to an A. the step-by-step grading is what made the difference — i could see exactly where i was going wrong." },
              { n: "Mr. Davis", r: "middle school teacher", q: "my students actually want to do math now. no gimmicks, no points-for-showing-up, just real problems that get real results." },
              { n: "Miguel R.", r: "parent of two", q: "safe, no ads, and my kid opens it voluntarily. that's the highest praise i can give a learning app." },
            ].map((t) => (
              <div key={t.n} className="border border-zinc-800/60 bg-[#0a0a0a] p-6">
                <p className="text-zinc-300 text-sm leading-relaxed">"{t.q}"</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zinc-800/60">
                  <div className="h-9 w-9 bg-[#c4f000] flex items-center justify-center text-black font-bold text-sm">
                    {t.n[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{t.n}</div>
                    <div className="text-xs text-zinc-500">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-6">
            <Sparkles className="h-3 w-3 text-[#c4f000]" />
            <span>no card · no catch · 30 seconds to start</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[0.95]">
            ready to <span className="text-[#c4f000]">figure it out</span>?
          </h2>
          <p className="text-zinc-400 mb-10 text-lg">
            No credit card. No "subscribe to unlock." Just a topic and a problem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-14 px-10 text-base group">
              <Link href="/auth/signup">
                start practicing
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 h-14 px-8 text-base">
              <Link href="/auth/signin">i have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#c4f000] flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">m</span>
            </div>
            <span className="font-semibold text-zinc-300">mathitout</span>
            <span className="text-zinc-700">·</span>
            <span>built for getting better, not for looking good</span>
          </div>
          <div className="flex items-center gap-5 text-zinc-600">
            <Link href="/auth/signin" className="hover:text-zinc-300 transition-colors">sign in</Link>
            <Link href="/auth/signup" className="hover:text-zinc-300 transition-colors">sign up</Link>
            <Link href="/learn" className="hover:text-zinc-300 transition-colors hidden sm:inline">courses</Link>
            <Link href="/solve" className="hover:text-zinc-300 transition-colors hidden sm:inline">solve</Link>
            <span className="text-zinc-700">·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
