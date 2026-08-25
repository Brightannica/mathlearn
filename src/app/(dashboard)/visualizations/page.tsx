"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlaskConical, Triangle, Circle, BarChart3, FunctionSquare } from "lucide-react";

function QuadraticExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const width = 500;
  const height = 400;
  const scaleX = width / 20;
  const scaleY = height / 10;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let px = 0; px <= width; px += 5) {
      const x = (px - width / 2) / scaleX;
      const y = a * x * x + b * x + c;
      const py = height / 2 - y * scaleY;
      if (py >= 0 && py <= height) {
        pts.push(`${pts.length === 0 ? "M" : "L"} ${px} ${py.toFixed(1)}`);
      }
    }
    return pts.join(" ");
  }, [a, b, c, scaleX, scaleY]);

  const vertex = { x: -b / (2 * a), y: c - (b * b) / (4 * a) };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quadratic Explorer</CardTitle>
        <CardDescription>Adjust coefficients to see how y = ax² + bx + c changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between"><span className="font-medium">a = {a}</span></div>
          <Slider value={[a]} min={-3} max={3} step={0.1} onValueChange={(v) => setA(v[0])} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="font-medium">b = {b}</span></div>
          <Slider value={[b]} min={-5} max={5} step={0.5} onValueChange={(v) => setB(v[0])} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="font-medium">c = {c}</span></div>
          <Slider value={[c]} min={-5} max={5} step={0.5} onValueChange={(v) => setC(v[0])} />
        </div>
        <svg width={width} height={height} className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border">
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
          <path d={path} stroke="hsl(var(--primary))" fill="none" strokeWidth={2} />
        </svg>
        <div className="text-sm text-muted-foreground">
          Equation: <span className="font-mono font-semibold text-foreground">y = {a}x² + {b}x + {c}</span>
          <br />Vertex: ({vertex.x.toFixed(1)}, {vertex.y.toFixed(1)})
        </div>
      </CardContent>
    </Card>
  );
}

function GeometryConstruction() {
  const [angle, setAngle] = useState(45);
  const baseX = 50;
  const baseY = 250;
  const sideLength = 280;
  const rad = (angle * Math.PI) / 180;
  const p1 = `${baseX},${baseY}`;
  const p2 = `${baseX + sideLength},${baseY}`;
  const p3 = `${baseX + sideLength * Math.cos(rad)},${baseY - sideLength * Math.sin(rad)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Triangle Explorer</CardTitle>
        <CardDescription>Explore triangle angles and the law of sines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between"><span className="font-medium">Angle A = {angle}°</span></div>
          <Slider value={[angle]} min={10} max={150} step={1} onValueChange={(v) => setAngle(v[0])} />
        </div>
        <svg width={400} height={300} className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border">
          <polygon
            points={`${p1} ${p2} ${p3}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          <line x1={baseX} y1={baseY} x2={baseX + sideLength} y2={baseY} stroke="hsl(var(--primary))" strokeWidth={2} />
          <line x1={baseX} y1={baseY} x2={baseX + sideLength * Math.cos(rad)} y2={baseY - sideLength * Math.sin(rad)} stroke="hsl(var(--primary))" strokeWidth={2} />
          <circle cx={baseX} cy={baseY} r={40} fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
        </svg>
        <div className="text-sm text-muted-foreground">
          Sum of angles in any triangle = 180°
        </div>
      </CardContent>
    </Card>
  );
}

function ProbabilitySimulator() {
  const [flips, setFlips] = useState(0);
  const [heads, setHeads] = useState(0);

  const flip = () => {
    const h = Math.random() < 0.5;
    setFlips((f) => f + 1);
    if (h) setHeads((hd) => hd + 1);
  };

  const flip100 = () => {
    let h = 0;
    for (let i = 0; i < 100; i++) if (Math.random() < 0.5) h++;
    setFlips((f) => f + 100);
    setHeads((hd) => hd + h);
  };

  const pHeads = flips > 0 ? ((heads / flips) * 100).toFixed(1) : "0.0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probability Simulator</CardTitle>
        <CardDescription>Coin flip simulation — watch probability converge</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-center">
          <div className="flex-1 rounded-lg bg-muted p-4">
            <p className="text-3xl font-bold">{flips}</p>
            <p className="text-xs text-muted-foreground">Total flips</p>
          </div>
          <div className="flex-1 rounded-lg bg-primary/10 p-4">
            <p className="text-3xl font-bold text-primary">{pHeads}%</p>
            <p className="text-xs text-muted-foreground">Heads rate</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={flip} className="flex-1">Flip</Button>
          <Button onClick={flip100} variant="secondary" className="flex-1">Flip 100x</Button>
          <Button onClick={() => { setFlips(0); setHeads(0); }} variant="outline">Reset</Button>
        </div>
        <div className="text-sm text-muted-foreground">
          As flips increase, the rate approaches the theoretical 50%.
        </div>
      </CardContent>
    </Card>
  );
}

function FractionVisualizer() {
  const [num, setNum] = useState(1);
  const [den, setDen] = useState(2);
  const cells = Array.from({ length: den }, (_, i) => i < num);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraction Visualizer</CardTitle>
        <CardDescription>See fractions as shaded parts of a whole</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="space-y-2 flex-1">
            <div className="flex justify-between text-sm"><span>Numerator</span><span className="font-bold">{num}</span></div>
            <Slider value={[num]} min={0} max={den} step={1} onValueChange={(v) => setNum(v[0])} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between text-sm"><span>Denominator</span><span className="font-bold">{den}</span></div>
            <Slider value={[den]} min={1} max={12} step={1} onValueChange={(v) => { setDen(v[0]); setNum((n) => Math.min(n, v[0])); }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cells.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-md border-2 border-primary",
                filled ? "bg-primary" : "bg-background"
              )}
            />
          ))}
        </div>
        <p className="text-center text-2xl font-bold font-mono">
          {num}/{den} = {den > 0 ? (num / den).toFixed(2) : "0"}
        </p>
      </CardContent>
    </Card>
  );
}

export default function VisualizationsPage() {
  const viz = [
    { id: "quadratic", name: "Quadratic Explorer", icon: FunctionSquare, desc: "Parabola coefficients" },
    { id: "geometry", name: "Triangle Explorer", icon: Triangle, desc: "Angle relationships" },
    { id: "probability", name: "Probability Simulator", icon: Circle, desc: "Coin flip convergence" },
    { id: "fraction", name: "Fraction Visualizer", icon: BarChart3, desc: "Visual fractions" },
  ];
  const [active, setActive] = useState("quadratic");

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" /> Visualizations
        </h1>
        <p className="text-muted-foreground mt-1">Interactive demos to build intuition</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {viz.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={cn(
              "text-left rounded-xl border p-4 transition-all hover:shadow-md",
              active === v.id ? "border-primary bg-primary/5" : "bg-card"
            )}
          >
            <v.icon className={cn("h-6 w-6 mb-2", active === v.id ? "text-primary" : "text-muted-foreground")} />
            <p className="font-semibold">{v.name}</p>
            <p className="text-xs text-muted-foreground">{v.desc}</p>
          </button>
        ))}
      </div>

      {active === "quadratic" && <QuadraticExplorer />}
      {active === "geometry" && <GeometryConstruction />}
      {active === "probability" && <ProbabilitySimulator />}
      {active === "fraction" && <FractionVisualizer />}
    </div>
  );
}
