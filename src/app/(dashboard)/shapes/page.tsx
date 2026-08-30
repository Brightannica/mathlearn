"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Triangle, Square, Circle as CircleIcon, Box, Layers, Hexagon,
  Octagon, Cylinder, Cone, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Shape = "rectangle" | "triangle" | "circle" | "square" | "trapezoid" | "hexagon" | "parallelogram" | "cylinder" | "cone" | "sphere" | "cube";

interface ShapeConfig {
  id: Shape;
  name: string;
  icon: any;
  params: { name: string; min: number; max: number; step: number; default: number; unit: string }[];
  formulas: { area?: string; perimeter?: string; volume?: string };
}

const SHAPES: ShapeConfig[] = [
  {
    id: "rectangle", name: "rectangle", icon: Square,
    params: [
      { name: "width", min: 1, max: 20, step: 0.5, default: 5, unit: "" },
      { name: "height", min: 1, max: 20, step: 0.5, default: 3, unit: "" },
    ],
    formulas: { area: "A = w × h", perimeter: "P = 2(w + h)" },
  },
  {
    id: "square", name: "square", icon: Square,
    params: [{ name: "side", min: 1, max: 20, step: 0.5, default: 4, unit: "" }],
    formulas: { area: "A = s²", perimeter: "P = 4s" },
  },
  {
    id: "triangle", name: "triangle", icon: Triangle,
    params: [
      { name: "base", min: 1, max: 20, step: 0.5, default: 6, unit: "" },
      { name: "height", min: 1, max: 15, step: 0.5, default: 4, unit: "" },
    ],
    formulas: { area: "A = ½ × b × h", perimeter: "P ≈ b + 2 × √((b/2)² + h²)" },
  },
  {
    id: "circle", name: "circle", icon: CircleIcon,
    params: [{ name: "radius", min: 0.5, max: 20, step: 0.5, default: 4, unit: "" }],
    formulas: { area: "A = πr²", perimeter: "C = 2πr" },
  },
  {
    id: "trapezoid", name: "trapezoid", icon: Layers,
    params: [
      { name: "base1", min: 1, max: 20, step: 0.5, default: 6, unit: "" },
      { name: "base2", min: 1, max: 20, step: 0.5, default: 4, unit: "" },
      { name: "height", min: 1, max: 15, step: 0.5, default: 3, unit: "" },
    ],
    formulas: { area: "A = ½(b₁ + b₂)h", perimeter: "P = b₁ + b₂ + 2√(((b₁-b₂)/2)² + h²)" },
  },
  {
    id: "hexagon", name: "regular hexagon", icon: Hexagon,
    params: [{ name: "side", min: 0.5, max: 10, step: 0.1, default: 3, unit: "" }],
    formulas: { area: "A = (3√3/2)s²", perimeter: "P = 6s" },
  },
  {
    id: "parallelogram", name: "parallelogram", icon: Square,
    params: [
      { name: "base", min: 1, max: 20, step: 0.5, default: 5, unit: "" },
      { name: "height", min: 1, max: 15, step: 0.5, default: 3, unit: "" },
    ],
    formulas: { area: "A = b × h", perimeter: "P = 2(b + s)" },
  },
  {
    id: "cube", name: "cube", icon: Box,
    params: [{ name: "side", min: 0.5, max: 10, step: 0.1, default: 3, unit: "" }],
    formulas: { area: "A = 6s²", volume: "V = s³" },
  },
  {
    id: "sphere", name: "sphere", icon: Globe,
    params: [{ name: "radius", min: 0.5, max: 10, step: 0.1, default: 3, unit: "" }],
    formulas: { area: "A = 4πr²", volume: "V = (4/3)πr³" },
  },
  {
    id: "cylinder", name: "cylinder", icon: Cylinder,
    params: [
      { name: "radius", min: 0.5, max: 10, step: 0.1, default: 2, unit: "" },
      { name: "height", min: 0.5, max: 15, step: 0.1, default: 5, unit: "" },
    ],
    formulas: { area: "A = 2πr(h + r)", volume: "V = πr²h" },
  },
  {
    id: "cone", name: "cone", icon: Cone,
    params: [
      { name: "radius", min: 0.5, max: 10, step: 0.1, default: 2, unit: "" },
      { name: "height", min: 0.5, max: 15, step: 0.1, default: 5, unit: "" },
    ],
    formulas: { area: "A = πr(r + s)", volume: "V = (1/3)πr²h" },
  },
];

const PI = Math.PI;

function computeMetrics(shape: Shape, params: Record<string, number>) {
  switch (shape) {
    case "rectangle": {
      const w = params.width || 0;
      const h = params.height || 0;
      return { area: w * h, perimeter: 2 * (w + h) };
    }
    case "square": {
      const s = params.side || 0;
      return { area: s * s, perimeter: 4 * s };
    }
    case "triangle": {
      const b = params.base || 0;
      const h = params.height || 0;
      const s = Math.sqrt((b / 2) ** 2 + h ** 2);
      return { area: 0.5 * b * h, perimeter: b + 2 * s };
    }
    case "circle": {
      const r = params.radius || 0;
      return { area: PI * r * r, perimeter: 2 * PI * r };
    }
    case "trapezoid": {
      const b1 = params.base1 || 0;
      const b2 = params.base2 || 0;
      const h = params.height || 0;
      const s = Math.sqrt(((b1 - b2) / 2) ** 2 + h ** 2);
      return { area: 0.5 * (b1 + b2) * h, perimeter: b1 + b2 + 2 * s };
    }
    case "hexagon": {
      const s = params.side || 0;
      return { area: (3 * Math.sqrt(3) / 2) * s * s, perimeter: 6 * s };
    }
    case "parallelogram": {
      const b = params.base || 0;
      const h = params.height || 0;
      return { area: b * h, perimeter: 2 * (b + h) };
    }
    case "cube": {
      const s = params.side || 0;
      return { area: 6 * s * s, volume: s * s * s };
    }
    case "sphere": {
      const r = params.radius || 0;
      return { area: 4 * PI * r * r, volume: (4 / 3) * PI * r * r * r };
    }
    case "cylinder": {
      const r = params.radius || 0;
      const h = params.height || 0;
      return { area: 2 * PI * r * (h + r), volume: PI * r * r * h };
    }
    case "cone": {
      const r = params.radius || 0;
      const h = params.height || 0;
      const s = Math.sqrt(r * r + h * h);
      return { area: PI * r * (r + s), volume: (1 / 3) * PI * r * r * h };
    }
  }
  return {};
}

function ShapeSVG({ shape, params }: { shape: Shape; params: Record<string, number> }) {
  const W = 300, H = 250;
  const scale = 12;

  if (shape === "rectangle") {
    const w = (params.width || 0) * scale;
    const h = (params.height || 0) * scale;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <rect x={(W - w) / 2} y={(H - h) / 2} width={w} height={h} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">
          {params.width} × {params.height}
        </text>
      </svg>
    );
  }
  if (shape === "square") {
    const s = (params.side || 0) * scale;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <rect x={(W - s) / 2} y={(H - s) / 2} width={s} height={s} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">
          s = {params.side}
        </text>
      </svg>
    );
  }
  if (shape === "triangle") {
    const b = (params.base || 0) * scale;
    const h = (params.height || 0) * scale;
    const x1 = (W - b) / 2, y1 = (H + h) / 2;
    const x2 = (W + b) / 2, y2 = (H + h) / 2;
    const x3 = W / 2, y3 = (H - h) / 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  if (shape === "circle") {
    const r = (params.radius || 0) * scale;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <circle cx={W / 2} cy={H / 2} r={r} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
        <line x1={W / 2} y1={H / 2} x2={W / 2 + r} y2={H / 2} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    );
  }
  if (shape === "hexagon") {
    const s = (params.side || 0) * scale;
    const cx = W / 2, cy = H / 2;
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(`${cx + s * Math.cos(angle)},${cy + s * Math.sin(angle)}`);
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <polygon points={pts.join(" ")} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  if (shape === "trapezoid") {
    const b1 = (params.base1 || 0) * scale;
    const b2 = (params.base2 || 0) * scale;
    const h = (params.height || 0) * scale;
    const cx = W / 2;
    const points = `${cx - b1 / 2},${H - 30} ${cx + b1 / 2},${H - 30} ${cx + b2 / 2},${H - 30 - h} ${cx - b2 / 2},${H - 30 - h}`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <polygon points={points} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  if (shape === "parallelogram") {
    const b = (params.base || 0) * scale;
    const h = (params.height || 0) * scale;
    const skew = 30;
    const points = `${50 + skew},${H - 30 - h} ${50 + skew + b},${H - 30 - h} ${50 + b},${H - 30} ${50},${H - 30}`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <polygon points={points} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  if (shape === "cube") {
    const s = (params.side || 0) * 10;
    return (
      <svg viewBox="0 0 300 250" className="w-full h-48">
        <polygon points={`${100},${80 - s/2} ${100 + s},${80 - s/2} ${100 + s + 30},${50 - s/2} ${100 + 30},${50 - s/2}`} fill="#c4f000" fillOpacity="0.1" stroke="#c4f000" strokeWidth="1.5" />
        <polygon points={`${100},${80 - s/2} ${100 + s},${80 - s/2} ${100 + s},${80 + s/2} ${100},${80 + s/2}`} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
        <polygon points={`${100 + s},${80 - s/2} ${100 + s + 30},${50 - s/2} ${100 + s + 30},${50 + s/2} ${100 + s},${80 + s/2}`} fill="#c4f000" fillOpacity="0.1" stroke="#c4f000" strokeWidth="1.5" />
      </svg>
    );
  }
  if (shape === "sphere") {
    const r = (params.radius || 0) * 10;
    return (
      <svg viewBox="0 0 300 250" className="w-full h-48">
        <circle cx="150" cy="125" r={r} fill="#c4f000" fillOpacity="0.15" stroke="#c4f000" strokeWidth="2" />
        <ellipse cx="150" cy="125" rx={r} ry={r * 0.3} fill="none" stroke="#c4f000" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />
        <ellipse cx="150" cy="125" rx={r * 0.3} ry={r} fill="none" stroke="#c4f000" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />
      </svg>
    );
  }
  if (shape === "cylinder") {
    const r = (params.radius || 0) * 10;
    const h = (params.height || 0) * 10;
    return (
      <svg viewBox="0 0 300 250" className="w-full h-48">
        <ellipse cx="150" cy={50} rx={r} ry={r * 0.3} fill="#c4f000" fillOpacity="0.1" stroke="#c4f000" strokeWidth="1.5" />
        <line x1={150 - r} y1={50} x2={150 - r} y2={50 + h} stroke="#c4f000" strokeWidth="2" />
        <line x1={150 + r} y1={50} x2={150 + r} y2={50 + h} stroke="#c4f000" strokeWidth="2" />
        <ellipse cx="150" cy={50 + h} rx={r} ry={r * 0.3} fill="#c4f000" fillOpacity="0.2" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  if (shape === "cone") {
    const r = (params.radius || 0) * 10;
    const h = (params.height || 0) * 10;
    return (
      <svg viewBox="0 0 300 250" className="w-full h-48">
        <line x1={150 - r} y1={50 + h} x2={150} y2={50} stroke="#c4f000" strokeWidth="2" />
        <line x1={150 + r} y1={50 + h} x2={150} y2={50} stroke="#c4f000" strokeWidth="2" />
        <ellipse cx="150" cy={50 + h} rx={r} ry={r * 0.3} fill="#c4f000" fillOpacity="0.2" stroke="#c4f000" strokeWidth="2" />
      </svg>
    );
  }
  return null;
}

export default function ShapeExplorerPage() {
  const [shapeId, setShapeId] = useState<Shape>("rectangle");
  const shape = SHAPES.find((s) => s.id === shapeId)!;
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SHAPES.find((s) => s.id === "rectangle")!.params.forEach((p) => { initial[p.name] = p.default; });
    return initial;
  });

  const changeShape = (id: Shape) => {
    setShapeId(id);
    const s = SHAPES.find((sh) => sh.id === id)!;
    const newParams: Record<string, number> = {};
    s.params.forEach((p) => { newParams[p.name] = p.default; });
    setParams(newParams);
  };

  const metrics = useMemo(() => computeMetrics(shapeId, params), [shapeId, params]);
  const Icon = shape.icon;

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// interactive geometry</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-7 w-7" />
          shape explorer
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">adjust dimensions. see area, perimeter, and volume update in real time.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {SHAPES.map((s) => {
          const SIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => changeShape(s.id)}
              className={cn(
                "px-3 py-1.5 text-xs border transition-colors flex items-center gap-1.5",
                shapeId === s.id
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              <SIcon className="h-3 w-3" />
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
          <ShapeSVG shape={shapeId} params={params} />
        </div>

        <div className="space-y-4">
          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 space-y-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// adjust</div>
            {shape.params.map((p) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 capitalize">{p.name}</span>
                  <span className="text-[#c4f000] font-mono font-semibold">{params[p.name]}{p.unit}</span>
                </div>
                <Slider
                  value={[params[p.name]]}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  onValueChange={(v) => setParams((prev) => ({ ...prev, [p.name]: v[0] }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4 space-y-2">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">// results</div>
            {metrics.area !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">area</span>
                <span className="text-[#c4f000] font-mono font-semibold">{metrics.area.toFixed(2)} sq units</span>
              </div>
            )}
            {metrics.perimeter !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">perimeter / circumference</span>
                <span className="text-[#c4f000] font-mono font-semibold">{metrics.perimeter.toFixed(2)} units</span>
              </div>
            )}
            {metrics.volume !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">volume</span>
                <span className="text-emerald-400 font-mono font-semibold">{metrics.volume.toFixed(2)} cubic units</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-[#0d0d0d] p-4">
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">// formulas</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {shape.formulas.area && (
            <div className="font-mono text-sm text-zinc-300">
              <span className="text-zinc-500 text-[10px]">area · </span>{shape.formulas.area}
            </div>
          )}
          {shape.formulas.perimeter && (
            <div className="font-mono text-sm text-zinc-300">
              <span className="text-zinc-500 text-[10px]">perimeter · </span>{shape.formulas.perimeter}
            </div>
          )}
          {shape.formulas.volume && (
            <div className="font-mono text-sm text-zinc-300">
              <span className="text-zinc-500 text-[10px]">volume · </span>{shape.formulas.volume}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
