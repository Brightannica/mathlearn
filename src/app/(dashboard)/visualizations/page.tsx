"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FlaskConical, Triangle, Circle, BarChart3, FunctionSquare, Sigma, Sparkles, Play, Pause, RotateCcw } from "lucide-react";

function QuadraticExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const W = 600;
  const H = 400;
  const range = 10;
  const scaleX = W / (range * 2);
  const scaleY = H / (range * 2);

  const path = useMemo(() => {
    const pts: string[] = [];
    let started = false;
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / scaleX;
      const y = a * x * x + b * x + c;
      const py = H / 2 - y * scaleY;
      if (py >= -20 && py <= H + 20) {
        pts.push(`${started ? "L" : "M"}${px},${py.toFixed(1)}`);
        started = true;
      } else {
        started = false;
      }
    }
    return pts.join(" ");
  }, [a, b, c, scaleX, scaleY]);

  const vertex = { x: -b / (2 * a), y: c - b * b / (4 * a) };
  const discriminant = b * b - 4 * a * c;
  const roots =
    discriminant >= 0 && a !== 0
      ? [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)]
      : null;

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-px bg-zinc-800/60 border border-zinc-800/60">
      <div className="bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <pattern id="qgrid" width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#qgrid)" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#44403c" />
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#44403c" />
          <path d={path} fill="none" stroke="#c4f000" strokeWidth="2.5" />
          {/* Vertex */}
          {a !== 0 && Math.abs(vertex.x) <= range && Math.abs(vertex.y) <= range && (
            <circle cx={W / 2 + vertex.x * scaleX} cy={H / 2 - vertex.y * scaleY} r="4" fill="#c4f000" stroke="#0a0a0a" strokeWidth="2" />
          )}
          {/* Roots */}
          {roots?.map((r, i) =>
            Math.abs(r) <= range ? (
              <g key={i}>
                <circle cx={W / 2 + r * scaleX} cy={H / 2} r="4" fill="#60a5fa" stroke="#0a0a0a" strokeWidth="2" />
                <text x={W / 2 + r * scaleX} y={H / 2 + 16} fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace">{r.toFixed(2)}</text>
              </g>
            ) : null
          )}
        </svg>
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 font-mono">a = {a.toFixed(2)}</span>
          </div>
          <Slider value={[a]} min={-3} max={3} step={0.1} onValueChange={(v) => setA(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 font-mono">b = {b.toFixed(2)}</span>
          </div>
          <Slider value={[b]} min={-10} max={10} step={0.5} onValueChange={(v) => setB(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 font-mono">c = {c.toFixed(2)}</span>
          </div>
          <Slider value={[c]} min={-10} max={10} step={0.5} onValueChange={(v) => setC(v[0])} />
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between"><span className="text-zinc-500">vertex</span><span className="text-zinc-200">({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">discriminant</span><span className={discriminant >= 0 ? "text-emerald-400" : "text-rose-400"}>{discriminant.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">roots</span><span className="text-zinc-200">{roots ? roots.map((r) => r.toFixed(2)).join(", ") : "complex"}</span></div>
        </div>
      </div>
    </div>
  );
}

function CircleExplorer() {
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);
  const [r, setR] = useState(3);
  const [theta, setTheta] = useState(0);

  const W = 600;
  const H = 400;
  const range = 10;
  const scaleX = W / (range * 2);
  const scaleY = H / (range * 2);
  const toPx = (x: number, y: number) => ({ px: W / 2 + x * scaleX, py: H / 2 - y * scaleY });

  const arcPath = useMemo(() => {
    const pts: string[] = [];
    for (let a = 0; a <= 2 * Math.PI; a += 0.05) {
      const p = toPx(cx + r * Math.cos(a), cy + r * Math.sin(a));
      pts.push(`${a === 0 ? "M" : "L"}${p.px},${p.py}`);
    }
    return pts.join(" ");
  }, [cx, cy, r]);

  const point = toPx(cx + r * Math.cos(theta), cy + r * Math.sin(theta));
  const area = Math.PI * r * r;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-px bg-zinc-800/60 border border-zinc-800/60">
      <div className="bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <pattern id="cgrid" width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#cgrid)" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#44403c" />
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#44403c" />
          <path d={arcPath} fill="none" stroke="#c4f000" strokeWidth="2.5" />
          {/* Center */}
          <circle cx={toPx(cx, cy).px} cy={toPx(cx, cy).py} r="4" fill="#a78bfa" stroke="#0a0a0a" strokeWidth="2" />
          {/* Radius line */}
          <line x1={toPx(cx, cy).px} y1={toPx(cx, cy).py} x2={point.px} y2={point.py} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Point on circle */}
          <circle cx={point.px} cy={point.py} r="5" fill="#c4f000" stroke="#0a0a0a" strokeWidth="2" />
          <text x={point.px + 8} y={point.py - 8} fill="#c4f000" fontSize="10" fontFamily="monospace">({(cx + r * Math.cos(theta)).toFixed(2)}, {(cy + r * Math.sin(theta)).toFixed(2)})</text>
        </svg>
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">center x = {cx.toFixed(1)}</span></div>
          <Slider value={[cx]} min={-5} max={5} step={0.1} onValueChange={(v) => setCx(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">center y = {cy.toFixed(1)}</span></div>
          <Slider value={[cy]} min={-5} max={5} step={0.1} onValueChange={(v) => setCy(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">radius = {r.toFixed(2)}</span></div>
          <Slider value={[r]} min={0.5} max={5} step={0.1} onValueChange={(v) => setR(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">θ = {((theta * 180) / Math.PI).toFixed(0)}°</span></div>
          <Slider value={[theta]} min={0} max={2 * Math.PI} step={0.05} onValueChange={(v) => setTheta(v[0])} />
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between"><span className="text-zinc-500">area</span><span className="text-zinc-200">{area.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">circumference</span><span className="text-zinc-200">{circumference.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">π × r²</span><span className="text-zinc-200">{(Math.PI * r * r).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

function TriangleExplorer() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [angleC, setAngleC] = useState(90);

  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((angleC * Math.PI) / 180));
  const angleA = (Math.asin((a * Math.sin((angleC * Math.PI) / 180)) / c) * 180) / Math.PI;
  const angleB = 180 - angleA - angleC;
  const area = 0.5 * a * b * Math.sin((angleC * Math.PI) / 180);
  const isRightTriangle = Math.abs(angleC - 90) < 0.5;

  const W = 600;
  const H = 400;
  const center = { x: W / 2, y: H / 2 + 50 };
  const scale = 60;

  const Ax = center.x - (a * scale) / 2;
  const Ay = center.y;
  const Bx = center.x + (b * scale) / 2;
  const By = center.y;
  const Cx = Ax + a * scale * Math.cos((angleC * Math.PI) / 180);
  const Cy = Ay - a * scale * Math.sin((angleC * Math.PI) / 180);

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-px bg-zinc-800/60 border border-zinc-800/60">
      <div className="bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#c4f000" strokeWidth="2.5" />
          <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke="#c4f000" strokeWidth="2.5" />
          <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke="#c4f000" strokeWidth="2.5" />
          {/* Right angle indicator */}
          {isRightTriangle && (
            <rect
              x={Ax + 5} y={Ay - 18}
              width={13} height={13}
              fill="none" stroke="#a78bfa" strokeWidth="1.5"
            />
          )}
          {/* Vertices */}
          {[[Ax, Ay, "A"], [Bx, By, "B"], [Cx, Cy, "C"]].map(([x, y, label], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#c4f000" stroke="#0a0a0a" strokeWidth="2" />
              <text x={(x as number) + (i === 0 ? -20 : i === 1 ? 10 : 0)} y={(y as number) + (i === 2 ? -10 : 20)} fill="#c4f000" fontSize="14" fontWeight="600">{label as string}</text>
            </g>
          ))}
          {/* Angle labels */}
          <text x={Ax - 30} y={Ay + 5} fill="#60a5fa" fontSize="11" fontFamily="monospace">{angleA.toFixed(0)}°</text>
          <text x={Bx + 10} y={By + 5} fill="#60a5fa" fontSize="11" fontFamily="monospace">{angleB.toFixed(0)}°</text>
          <text x={(Ax + Cx) / 2 - 20} y={(Ay + Cy) / 2 - 10} fill="#a78bfa" fontSize="11" fontFamily="monospace">{angleC.toFixed(0)}°</text>
          {/* Side labels */}
          <text x={(Ax + Bx) / 2} y={Ay + 25} fill="#888" fontSize="11" fontFamily="monospace" textAnchor="middle">c = {c.toFixed(2)}</text>
          <text x={Ax - 25} y={(Ay + Cy) / 2} fill="#888" fontSize="11" fontFamily="monospace">a = {a.toFixed(1)}</text>
          <text x={Bx + 10} y={(By + Cy) / 2} fill="#888" fontSize="11" fontFamily="monospace">b = {b.toFixed(1)}</text>
        </svg>
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">side a = {a.toFixed(1)}</span></div>
          <Slider value={[a]} min={1} max={5} step={0.1} onValueChange={(v) => setA(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">side b = {b.toFixed(1)}</span></div>
          <Slider value={[b]} min={1} max={5} step={0.1} onValueChange={(v) => setB(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">angle C = {angleC.toFixed(0)}°</span></div>
          <Slider value={[angleC]} min={10} max={170} step={1} onValueChange={(v) => setAngleC(v[0])} />
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between"><span className="text-zinc-500">side c</span><span className="text-zinc-200">{c.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">area</span><span className="text-zinc-200">{area.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">perimeter</span><span className="text-zinc-200">{(a + b + c).toFixed(2)}</span></div>
          {isRightTriangle && <div className="text-emerald-400 text-[10px]">✓ right triangle · a² + b² = c²</div>}
        </div>
      </div>
    </div>
  );
}

function UnitCircle() {
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setAngle((a) => (a + dt * 0.8) % (2 * Math.PI));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [playing]);

  const W = 600;
  const H = 400;
  const center = { x: W / 2, y: H / 2 };
  const r = 120;
  const px = center.x + r * Math.cos(angle);
  const py = center.y - r * Math.sin(angle);
  const sinVal = Math.sin(angle);
  const cosVal = Math.cos(angle);

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-px bg-zinc-800/60 border border-zinc-800/60">
      <div className="bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Axes */}
          <line x1="0" y1={center.y} x2={W} y2={center.y} stroke="#44403c" />
          <line x1={center.x} y1="0" x2={center.x} y2={H} stroke="#44403c" />

          {/* Unit circle */}
          <circle cx={center.x} cy={center.y} r={r} fill="none" stroke="#44403c" strokeWidth="1.5" />

          {/* Angle arc */}
          <path
            d={`M ${center.x + r * 0.3} ${center.y} A ${r * 0.3} ${r * 0.3} 0 ${angle > Math.PI ? 1 : 0} 0 ${center.x + r * 0.3 * Math.cos(-angle)} ${center.y + r * 0.3 * Math.sin(-angle)}`}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
          />

          {/* Radius line */}
          <line x1={center.x} y1={center.y} x2={px} y2={py} stroke="#c4f000" strokeWidth="2" />

          {/* Vertical (sin) */}
          <line x1={center.x} y1={center.y} x2={px} y2={center.y} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" />
          {/* Horizontal (cos) */}
          <line x1={center.x} y1={center.y} x2={center.x} y2={py} stroke="#f472b6" strokeWidth="2" strokeDasharray="4 4" />

          {/* Point on circle */}
          <circle cx={px} cy={py} r="5" fill="#c4f000" stroke="#0a0a0a" strokeWidth="2" />

          {/* Axis labels */}
          <text x={W - 14} y={center.y - 6} fill="#60a5fa" fontSize="11" fontFamily="monospace">cos</text>
          <text x={center.x + 6} y={14} fill="#f472b6" fontSize="11" fontFamily="monospace">sin</text>
          <text x={W - 6} y={center.y - 6} fill="#52525b" fontSize="10" textAnchor="end">1</text>
          <text x={center.x - 6} y={14} fill="#52525b" fontSize="10" textAnchor="end">1</text>
        </svg>
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setPlaying(!playing)} className="px-3 py-1.5 border border-zinc-800 text-zinc-300 hover:border-[#c4f000] hover:text-[#c4f000] transition-colors flex items-center gap-1.5 text-xs">
            {playing ? <><Pause className="h-3 w-3" /> pause</> : <><Play className="h-3 w-3" /> animate</>}
          </button>
          <button onClick={() => { setAngle(0); setPlaying(false); }} className="px-3 py-1.5 border border-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs">
            <RotateCcw className="h-3 w-3" /> reset
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">θ = {((angle * 180) / Math.PI).toFixed(0)}°</span></div>
          <Slider value={[angle]} min={0} max={2 * Math.PI} step={0.01} onValueChange={(v) => setAngle(v[0])} />
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between"><span className="text-zinc-500">sin(θ)</span><span className="text-fuchsia-400">{sinVal.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">cos(θ)</span><span className="text-sky-400">{cosVal.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">sin² + cos²</span><span className="text-emerald-400">{(sinVal * sinVal + cosVal * cosVal).toFixed(4)}</span></div>
          <div className="text-[10px] text-zinc-600 pt-1">identity: sin²(θ) + cos²(θ) = 1</div>
        </div>
      </div>
    </div>
  );
}

function DistributionExplorer() {
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.5);

  const W = 600;
  const H = 300;
  const barW = W / 30;
  const maxBars = 30;

  const data = useMemo(() => {
    // Binomial distribution
    const factorial = (k: number): number => (k <= 1 ? 1 : k * factorial(k - 1));
    const comb = (n: number, k: number): number => factorial(n) / (factorial(k) * factorial(n - k));
    const probs: number[] = [];
    let maxProb = 0;
    for (let k = 0; k <= n && k < maxBars; k++) {
      const prob = comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      probs.push(prob);
      if (prob > maxProb) maxProb = prob;
    }
    return { probs, maxProb };
  }, [n, p]);

  const mean = n * p;
  const variance = n * p * (1 - p);
  const stdDev = Math.sqrt(variance);

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-px bg-zinc-800/60 border border-zinc-800/60">
      <div className="bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1="0" y1={H - 20} x2={W} y2={H - 20} stroke="#44403c" />
          {data.probs.map((prob, i) => {
            const height = (prob / (data.maxProb || 1)) * (H - 40);
            return (
              <g key={i}>
                <rect
                  x={i * barW + 2}
                  y={H - 20 - height}
                  width={barW - 4}
                  height={height}
                  fill="#c4f000"
                  opacity="0.85"
                />
                {i % 2 === 0 && (
                  <text x={i * barW + barW / 2} y={H - 6} fill="#52525b" fontSize="9" textAnchor="middle" fontFamily="monospace">{i}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">trials (n) = {n}</span></div>
          <Slider value={[n]} min={5} max={50} step={1} onValueChange={(v) => setN(v[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-zinc-500 font-mono">probability (p) = {p.toFixed(2)}</span></div>
          <Slider value={[p]} min={0.05} max={0.95} step={0.05} onValueChange={(v) => setP(v[0])} />
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between"><span className="text-zinc-500">mean μ</span><span className="text-zinc-200">{mean.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">variance σ²</span><span className="text-zinc-200">{variance.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">std dev σ</span><span className="text-zinc-200">{stdDev.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function VisualizationsPage() {
  const [active, setActive] = useState("quadratic");

  const demos = [
    { id: "quadratic", name: "Quadratic Explorer", icon: FunctionSquare, desc: "ax² + bx + c" },
    { id: "circle", name: "Circle & Trig", icon: Circle, desc: "Unit circle" },
    { id: "triangle", name: "Triangle Solver", icon: Triangle, desc: "Sides & angles" },
    { id: "unitcircle", name: "Unit Circle", icon: Sigma, desc: "sin/cos animation" },
    { id: "distribution", name: "Distribution", icon: BarChart3, desc: "Binomial PMF" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// interactive demos</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-7 w-7" />
            visualizations
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">play with parameters. see what happens. build intuition.</p>
        </div>
      </div>

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {demos.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={cn(
                "p-4 text-left transition-colors",
                active === d.id ? "bg-[#0d0d0d]" : "bg-[#0a0a0a] hover:bg-[#0d0d0d]"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={cn("h-4 w-4", active === d.id ? "text-[#c4f000]" : "text-zinc-500")} />
                <span className={cn("font-semibold text-sm", active === d.id ? "text-zinc-100" : "text-zinc-300")}>{d.name}</span>
              </div>
              <p className="text-xs text-zinc-500">{d.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {active === "quadratic" && (
          <div>
            <div className="mb-3 text-sm text-zinc-400">
              <span className="text-zinc-600 font-mono">f(x) = ax² + bx + c</span> — drag the sliders to see the parabola, vertex, and roots change in real time.
            </div>
            <QuadraticExplorer />
          </div>
        )}
        {active === "circle" && (
          <div>
            <div className="mb-3 text-sm text-zinc-400">
              <span className="text-zinc-600 font-mono">(x − cx)² + (y − cy)² = r²</span> — move the center, change the radius, and drag θ around the circle.
            </div>
            <CircleExplorer />
          </div>
        )}
        {active === "triangle" && (
          <div>
            <div className="mb-3 text-sm text-zinc-400">
              Law of cosines: <span className="text-zinc-600 font-mono">c² = a² + b² − 2ab·cos(C)</span>
            </div>
            <TriangleExplorer />
          </div>
        )}
        {active === "unitcircle" && (
          <div>
            <div className="mb-3 text-sm text-zinc-400">
              watch how <span className="text-fuchsia-400 font-mono">sin(θ)</span> and <span className="text-sky-400 font-mono">cos(θ)</span> trace the vertical and horizontal projections.
            </div>
            <UnitCircle />
          </div>
        )}
        {active === "distribution" && (
          <div>
            <div className="mb-3 text-sm text-zinc-400">
              binomial distribution: <span className="text-zinc-600 font-mono">P(k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ</span>
            </div>
            <DistributionExplorer />
          </div>
        )}
      </div>
    </div>
  );
}
