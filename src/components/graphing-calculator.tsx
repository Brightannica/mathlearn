"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { evaluate, parse } from "mathjs";
import { Plus, X, Trash2, ZoomIn, ZoomOut, Move, Maximize2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Graph = { id: string; expr: string; color: string };

const PALETTE = ["#c4f000", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#4ade80", "#fb7185", "#22d3ee"];

function compile(expr: string): ((x: number) => number) | null {
  try {
    const node = parse(expr);
    const code = node.compile();
    return (x: number) => {
      try {
        return code.evaluate({ x });
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

export function GraphingCalculator() {
  const [graphs, setGraphs] = useState<Graph[]>([
    { id: "1", expr: "sin(x)", color: PALETTE[0] },
  ]);
  const [input, setInput] = useState("x^2");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; graphId: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 800;
  const H = 500;

  const compiled = useMemo(() => {
    return graphs.map((g) => ({ ...g, fn: compile(g.expr) }));
  }, [graphs]);

  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const toSvgY = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  const fromSvgX = (sx: number) => xMin + (sx / W) * (xMax - xMin);
  const fromSvgY = (sy: number) => yMax - (sy / H) * (yMax - yMin);

  const paths = useMemo(() => {
    return compiled.map((g) => {
      if (!g.fn) return { ...g, d: "" };
      const points: string[] = [];
      const step = (xMax - xMin) / W;
      let started = false;
      for (let i = 0; i <= W; i++) {
        const x = xMin + i * step;
        const y = g.fn(x);
        if (Number.isFinite(y) && y >= yMin - 50 && y <= yMax + 50) {
          const sx = toSvgX(x);
          const sy = toSvgY(y);
          points.push(`${started ? "L" : "M"}${sx.toFixed(2)},${sy.toFixed(2)}`);
          started = true;
        } else {
          started = false;
        }
      }
      return { ...g, d: points.join(" ") };
    });
  }, [compiled, xMin, xMax, yMin, yMax]);

  const addGraph = () => {
    const expr = input.trim();
    if (!expr) return;
    if (graphs.some((g) => g.expr === expr)) return;
    if (!compile(expr)) return;
    setGraphs((prev) => [
      ...prev,
      { id: String(Date.now()), expr, color: PALETTE[prev.length % PALETTE.length] },
    ]);
    setInput("");
  };

  const removeGraph = (id: string) => {
    setGraphs((prev) => prev.filter((g) => g.id !== id));
  };

  const resetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  const zoom = (factor: number, cx?: number, cy?: number) => {
    const centerX = cx ?? (xMin + xMax) / 2;
    const centerY = cy ?? (yMin + yMax) / 2;
    const newXHalf = ((xMax - xMin) / 2) * factor;
    const newYHalf = ((yMax - yMin) / 2) * factor;
    setXMin(centerX - newXHalf);
    setXMax(centerX + newXHalf);
    setYMin(centerY - newYHalf);
    setYMax(centerY + newYHalf);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    const x = fromSvgX(sx);
    const y = fromSvgY(sy);

    if (dragging && dragStart) {
      const dx = (sx - dragStart.x) / W * (dragStart.xMax - dragStart.xMin);
      const dy = (dragStart.y - sy) / H * (dragStart.yMax - dragStart.yMin);
      setXMin(dragStart.xMin - dx);
      setXMax(dragStart.xMax - dx);
      setYMin(dragStart.yMin + dy);
      setYMax(dragStart.yMax + dy);
      return;
    }

    // Find nearest graph
    let best: { y: number; graphId: string; dist: number } | null = null;
    for (const g of compiled) {
      if (!g.fn) continue;
      const gy = g.fn(x);
      if (!Number.isFinite(gy)) continue;
      const dsy = Math.abs(toSvgY(gy) - sy);
      if (!best || dsy < best.dist) {
        best = { y: gy, graphId: g.id, dist: dsy };
      }
    }
    if (best && best.dist < 15) {
      setHoverPoint({ x, y: best.y, graphId: best.graphId });
    } else {
      setHoverPoint(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    setDragging(true);
    setDragStart({ x: sx, y: sy, xMin, xMax, yMin, yMax });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    zoom(factor, fromSvgX(sx), fromSvgY(sy));
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addGraph(); }}
            placeholder="f(x) = sin(x), x^2, 2^x, sqrt(x)..."
            className="flex-1 bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-sm focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
          />
          <Button onClick={addGraph} className="bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold">
            <Plus className="h-4 w-4 mr-1" /> plot
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["sin(x)", "cos(x)", "x^2", "x^3", "sqrt(x)", "2^x", "log(x)", "1/x", "tan(x)", "abs(x)"].map((expr) => (
            <button
              key={expr}
              onClick={() => setInput(expr)}
              className="px-2 py-1 text-xs border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 transition-colors font-mono"
            >
              {expr}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px]">
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className={cn("w-full h-[500px] bg-[#0a0a0a] select-none", dragging ? "cursor-grabbing" : "cursor-crosshair")}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { handleMouseUp(); setHoverPoint(null); }}
            onWheel={handleWheel}
          >
            {/* Grid */}
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#262626" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid)" />

            {/* Axes */}
            {xMin < 0 && xMax > 0 && (
              <line x1={toSvgX(0)} y1="0" x2={toSvgX(0)} y2={H} stroke="#44403c" strokeWidth="1" />
            )}
            {yMin < 0 && yMax > 0 && (
              <line x1="0" y1={toSvgY(0)} x2={W} y2={toSvgY(0)} stroke="#44403c" strokeWidth="1" />
            )}

            {/* Axis labels */}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((n) => {
              if (n >= xMin && n <= xMax) {
                return (
                  <text
                    key={`x${n}`}
                    x={toSvgX(n)}
                    y={toSvgY(0) + 14}
                    fill="#52525b"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {n}
                  </text>
                );
              }
              return null;
            })}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((n) => {
              if (n >= yMin && n <= yMax) {
                return (
                  <text
                    key={`y${n}`}
                    x={toSvgX(0) + 6}
                    y={toSvgY(n) + 4}
                    fill="#52525b"
                    fontSize="10"
                  >
                    {n}
                  </text>
                );
              }
              return null;
            })}

            {/* Graphs */}
            {paths.map((p) => (
              <path key={p.id} d={p.d} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" />
            ))}

            {/* Hover point */}
            {hoverPoint && (
              <>
                <circle cx={toSvgX(hoverPoint.x)} cy={toSvgY(hoverPoint.y)} r="4" fill={graphs.find((g) => g.id === hoverPoint.graphId)?.color} stroke="#0a0a0a" strokeWidth="2" />
                <line x1={toSvgX(hoverPoint.x)} y1="0" x2={toSvgX(hoverPoint.x)} y2={H} stroke={graphs.find((g) => g.id === hoverPoint.graphId)?.color} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                <line x1="0" y1={toSvgY(hoverPoint.y)} x2={W} y2={toSvgY(hoverPoint.y)} stroke={graphs.find((g) => g.id === hoverPoint.graphId)?.color} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                <g transform={`translate(${Math.min(toSvgX(hoverPoint.x) + 10, W - 120)}, ${Math.max(toSvgY(hoverPoint.y) - 30, 10)})`}>
                  <rect width="110" height="36" fill="#0a0a0a" stroke={graphs.find((g) => g.id === hoverPoint.graphId)?.color} strokeWidth="1" />
                  <text x="6" y="14" fill="#a1a1aa" fontSize="9" fontFamily="monospace">x = {hoverPoint.x.toFixed(3)}</text>
                  <text x="6" y="28" fill="#a1a1aa" fontSize="9" fontFamily="monospace">y = {hoverPoint.y.toFixed(3)}</text>
                </g>
              </>
            )}
          </svg>

          {/* Zoom controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
            <button onClick={() => zoom(0.7)} className="w-8 h-8 border border-zinc-700 bg-[#0d0d0d] hover:border-[#c4f000] hover:text-[#c4f000] text-zinc-400 flex items-center justify-center transition-colors">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => zoom(1.4)} className="w-8 h-8 border border-zinc-700 bg-[#0d0d0d] hover:border-[#c4f000] hover:text-[#c4f000] text-zinc-400 flex items-center justify-center transition-colors">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={resetView} className="w-8 h-8 border border-zinc-700 bg-[#0d0d0d] hover:border-[#c4f000] hover:text-[#c4f000] text-zinc-400 flex items-center justify-center transition-colors">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="absolute top-3 left-3 text-[10px] text-zinc-600 font-mono space-y-0.5 pointer-events-none">
            <div>drag to pan · scroll to zoom · hover to inspect</div>
            <div className="text-zinc-700">x: [{xMin.toFixed(2)}, {xMax.toFixed(2)}]  y: [{yMin.toFixed(2)}, {yMax.toFixed(2)}]</div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-zinc-800/60 p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-3">// functions</div>
          {graphs.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">no functions plotted</div>
          ) : (
            graphs.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-2 p-2 border border-zinc-800/40 hover:border-zinc-700 group"
              >
                <div className="w-2 h-2 shrink-0" style={{ backgroundColor: g.color }} />
                <code className="text-xs font-mono text-zinc-200 flex-1 truncate">{g.expr}</code>
                <button
                  onClick={() => removeGraph(g.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
          {graphs.length > 0 && (
            <button
              onClick={() => setGraphs([])}
              className="w-full mt-2 px-2 py-1.5 text-xs border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-400/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-3 w-3" /> clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
