"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Terminal, Activity, GitBranch, Zap, Hash,
  Box, Layers, Cpu, Command, ChevronRight, Square,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-mono selection:bg-[#c4f000] selection:text-black">
      {/* Top status bar — like an IDE */}
      <div className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4f000] animate-pulse" />
              all systems operational
            </span>
            <span className="hidden sm:inline">v0.1.0 — built on render</span>
          </div>
          <div className="flex items-center gap-3">
            <span>k–12</span>
            <span>·</span>
            <span>free, no card</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="border-b border-zinc-800/60 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c4f000] flex items-center justify-center">
              <span className="text-black font-bold text-sm">m</span>
            </div>
            <span className="font-semibold text-base tracking-tight">mathitout</span>
            <span className="text-zinc-600 text-xs hidden sm:inline">/ figure it out, properly</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="#features" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">features</Link>
            <Link href="#how" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:inline">how it works</Link>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,240,0,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
                <Terminal className="h-3 w-3" />
                <span>npm install mathitout && npm run figure-it-out</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]">
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
                <Button asChild size="lg" className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-12 px-6">
                  <Link href="/auth/signup">
                    start practicing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 h-12 px-6">
                  <Link href="#how">how it works</Link>
                </Button>
                <div className="text-xs text-zinc-600 ml-2 font-mono">no credit card · k–12 coverage</div>
              </div>

              {/* Quick stats — terminal style */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800/60 border border-zinc-800/60">
                {[
                  { k: "topics", v: "60+" },
                  { k: "problems", v: "2,400" },
                  { k: "avg. session", v: "18m" },
                  { k: "price", v: "$0" },
                ].map((s) => (
                  <div key={s.k} className="bg-[#0a0a0a] p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">{s.k}</div>
                    <div className="text-2xl font-semibold mt-1 text-zinc-100">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: a fake terminal showing the app */}
            <div className="lg:col-span-5">
              <div className="border border-zinc-800 bg-[#0d0d0d] shadow-2xl">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
                  <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
                  <Square className="h-2.5 w-2.5 fill-zinc-700 text-zinc-700" />
                  <span className="ml-2 text-xs text-zinc-500">mathitout — session.k</span>
                </div>
                <div className="p-4 font-mono text-sm space-y-1.5">
                  <div className="text-zinc-600">$ mathitout solve --topic algebra</div>
                  <div className="text-[#c4f000]">→ loaded 47 problems in your weak areas</div>
                  <div className="text-zinc-300 mt-3">  problem 3 / 10 · linear equations</div>
                  <div className="text-zinc-100 text-base py-2 px-3 bg-zinc-900/60 border-l-2 border-[#c4f000] my-2">
                    Solve: 3(x + 2) − 4 = 2x + 7
                  </div>
                  <div className="text-zinc-500 text-xs">▌ your working...</div>
                  <div className="flex items-center gap-2 text-xs pt-2">
                    <span className="text-zinc-600">[hint]</span>
                    <span className="text-zinc-400">distribute the 3 first</span>
                  </div>
                  <div className="text-zinc-600 pt-2">$ _</div>
                </div>
              </div>

              <div className="mt-3 px-1 text-xs text-zinc-600 font-mono">
                ↑ your work, not multiple choice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — command-line style */}
      <section id="features" className="border-t border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// what you get</div>
            <h2 className="text-4xl font-bold tracking-tight">
              mathitout<span className="text-zinc-600">.features</span>
            </h2>
            <p className="text-zinc-400 mt-3">Six things. No more, no less. Each one does one job.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/60 border border-zinc-800/60">
            {[
              { icon: Layers, k: "01", t: "Topic tree", d: "K through Calc, broken into 60+ specific topics. Pick exactly what you're working on.", c: "[layers]" },
              { icon: Cpu, k: "02", t: "Auto-grader", d: "Not just final answer. Step-by-step checking. Partial credit when you've earned it.", c: "[compute]" },
              { icon: Activity, k: "03", t: "Weakness map", d: "See exactly which sub-skill is costing you points. Drill that. Skip what you know.", c: "[analyze]" },
              { icon: GitBranch, k: "04", t: "Branching hints", d: "Stuck? Get a hint calibrated to where you are. Not the answer, the next move.", c: "[hint:2]" },
              { icon: Hash, k: "05", t: "Spaced review", d: "Problems resurface right before you'd forget them. Long-term memory, not cramming.", c: "[review]" },
              { icon: Command, k: "06", t: "Keyboard-first", d: "Type your answer. Tab between fields. No mouse, no friction.", c: "[cmd+k]" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.k} className="bg-[#0d0d0d] p-6 group hover:bg-[#111] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="h-5 w-5 text-[#c4f000]" />
                    <span className="text-xs text-zinc-600 font-mono">{f.c}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mb-1">{f.k}</div>
                  <div className="text-lg font-semibold text-zinc-100 mb-2">{f.t}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{f.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — code block style */}
      <section id="how" className="border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// the loop</div>
              <h2 className="text-4xl font-bold tracking-tight mb-6">How practice actually works.</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Most math apps optimize for "engagement" — keeping you clicking.
                We optimize for the one thing that matters: you understanding the next problem.
              </p>
              <div className="space-y-3">
                {[
                  "You see a problem, not a video about a problem.",
                  "You write your working. We check each step.",
                  "When you're wrong, we tell you exactly which step, and why.",
                  "Tomorrow, similar problems resurface — calibrated to your forgetting curve.",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-[#c4f000] font-mono mt-0.5">0{i + 1}.</span>
                    <span className="text-zinc-300">{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
                  <Link href="/auth/signup">try it <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#0d0d0d]">
              <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500 flex items-center gap-2">
                <Terminal className="h-3 w-3" />
                weakness-report.json
              </div>
              <pre className="p-4 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="border-t border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <div className="text-xs uppercase tracking-widest text-[#c4f000] mb-3">// coverage</div>
            <h2 className="text-3xl font-bold tracking-tight">K to 12. Pre-alg to AP Calc.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["K", "1", "2", "3", "4", "5", "6", "7", "8", "Algebra I", "Geometry", "Algebra II", "Pre-calc", "AP Stats", "AP Calc AB", "AP Calc BC"].map((g) => (
              <span key={g} className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-300 hover:border-[#c4f000] hover:text-[#c4f000] transition-colors cursor-default">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            ready to <span className="text-[#c4f000]">figure it out</span>?
          </h2>
          <p className="text-zinc-400 mb-8">
            No credit card. No "subscribe to unlock." Just a topic and a problem.
          </p>
          <Button asChild size="lg" className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold h-12 px-8">
            <Link href="/auth/signup">
              start practicing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#c4f000] flex items-center justify-center">
              <span className="text-black font-bold text-[8px]">m</span>
            </div>
            <span>mathitout</span>
            <span className="text-zinc-700">·</span>
            <span>built for getting better, not for looking good</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="hover:text-zinc-300 transition-colors">sign in</Link>
            <Link href="/auth/signup" className="hover:text-zinc-300 transition-colors">sign up</Link>
            <span className="text-zinc-700">·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
