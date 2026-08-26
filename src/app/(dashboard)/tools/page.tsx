"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluate } from "mathjs";
import { Calculator, Sigma, Grid3x3, Ruler, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { GraphingCalculator } from "@/components/graphing-calculator";
import { MatrixSolver } from "@/components/matrix-solver";

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");

  const buttons = [
    ["C", "(", ")", "÷"],
    ["sin", "cos", "tan", "×"],
    ["7", "8", "9", "−"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "π"],
    ["0", ".", "⌫", "="],
  ];

  const handleClick = (btn: string) => {
    if (btn === "C") {
      setDisplay("0");
    } else if (btn === "⌫") {
      setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
    } else if (btn === "=") {
      try {
        let expr = display
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-")
          .replace(/π/g, "pi")
          .replace(/sin\(/g, angleMode === "DEG" ? "sin(pi/180*" : "sin(")
          .replace(/cos\(/g, angleMode === "DEG" ? "cos(pi/180*" : "cos(")
          .replace(/tan\(/g, angleMode === "DEG" ? "tan(pi/180*" : "tan(");
        // Balance extra parens for angle conversion
        const openCount = (display.match(/\(/g) || []).length;
        const closeCount = (display.match(/\)/g) || []).length;
        if (angleMode === "DEG" && openCount > closeCount) {
          expr += ")".repeat(openCount - closeCount);
        }
        const result = evaluate(expr);
        setHistory([`${display} = ${typeof result === "number" ? result.toString().slice(0, 12) : result}`, ...history].slice(0, 5));
        setDisplay(typeof result === "number" ? String(parseFloat(result.toFixed(8))) : String(result));
      } catch {
        setDisplay("error");
      }
    } else if (["sin", "cos", "tan"].includes(btn)) {
      setDisplay(display === "0" ? `${btn}(` : display + `${btn}(`);
    } else {
      setDisplay(display === "0" ? btn : display + btn);
    }
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-sm">Scientific Calculator</span>
        </div>
        <div className="flex border border-zinc-800">
          {(["DEG", "RAD"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setAngleMode(m)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors",
                angleMode === m
                  ? "bg-[#c4f000] text-black"
                  : "text-zinc-500 hover:text-zinc-100"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="border border-zinc-800 bg-[#0a0a0a] p-4 text-right">
          <div className="text-xs text-zinc-600 font-mono h-4 overflow-hidden truncate">
            {history[0]?.split(" = ")[0] || " "}
          </div>
          <div className="text-3xl font-mono text-zinc-100 mt-1 truncate">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {buttons.flat().map((btn, i) => (
            <button
              key={i}
              onClick={() => handleClick(btn)}
              className={cn(
                "h-12 font-mono text-sm border transition-colors",
                btn === "="
                  ? "bg-[#c4f000] text-black border-[#c4f000] hover:bg-[#b3d800] font-bold"
                  : btn === "C"
                  ? "border-zinc-800 text-rose-400 hover:bg-zinc-900 hover:border-rose-400/30"
                  : btn === "⌫"
                  ? "border-zinc-800 text-amber-400 hover:bg-zinc-900 hover:border-amber-400/30"
                  : ["÷", "×", "−", "+"].includes(btn) || ["sin", "cos", "tan", "π"].includes(btn)
                  ? "border-zinc-800 text-[#c4f000] hover:bg-zinc-900 hover:border-[#c4f000]/30"
                  : "border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:border-zinc-700"
              )}
            >
              {btn}
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div className="border border-zinc-800/60 bg-[#0a0a0a] p-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-2">// history</div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="text-xs font-mono text-zinc-400 truncate">{h}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function UnitConverter() {
  const categories = {
    Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, yd: 0.9144, mi: 1609.34 },
    Mass: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 },
    Time: { s: 1, ms: 0.001, min: 60, hr: 3600, day: 86400, week: 604800, year: 31536000 },
    Area: { "m²": 1, "km²": 1e6, "cm²": 0.0001, "ft²": 0.092903, acre: 4046.86, hectare: 10000 },
    Volume: { L: 1, mL: 0.001, "m³": 1000, "ft³": 28.3168, gal: 3.78541, cup: 0.236588 },
    Speed: { "m/s": 1, "km/h": 0.277778, "mph": 0.44704, "ft/s": 0.3048, knot: 0.514444 },
  };
  const [cat, setCat] = useState<keyof typeof categories>("Length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [val, setVal] = useState("1");

  const convert = () => {
    const units = categories[cat] as Record<string, number>;
    const base = parseFloat(val) * (units[from] ?? 1);
    const result = base / (units[to] ?? 1);
    return isFinite(result) ? result.toFixed(6).replace(/\.?0+$/, "") : "error";
  };

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-4 border-b border-zinc-800/60 flex items-center gap-2">
        <Ruler className="h-4 w-4 text-zinc-500" />
        <span className="font-semibold text-sm">Unit Converter</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(Object.keys(categories) as (keyof typeof categories)[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setFrom("m"); setTo(Object.keys(categories[c])[0]); }}
              className={cn(
                "px-3 py-1.5 text-xs border transition-colors",
                cat === c
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <div className="space-y-1.5">
            <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 font-mono text-lg h-12 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20" />
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-9 bg-[#0a0a0a] border border-zinc-800 text-zinc-100 text-sm px-2 focus:border-[#c4f000] focus:outline-none">
              {Object.keys(categories[cat]).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <button onClick={swap} className="w-8 h-8 border border-zinc-800 text-zinc-500 hover:border-[#c4f000] hover:text-[#c4f000] transition-colors">⇄</button>
          <div className="space-y-1.5">
            <div className="bg-[#0a0a0a] border border-[#c4f000]/30 h-12 px-3 flex items-center font-mono text-lg text-[#c4f000] font-semibold">{convert()}</div>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full h-9 bg-[#0a0a0a] border border-zinc-800 text-zinc-100 text-sm px-2 focus:border-[#c4f000] focus:outline-none">
              {Object.keys(categories[cat]).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono text-center">
          {val} {from} = {convert()} {to}
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const tools = [
    { id: "graphing", name: "Graphing Calculator", icon: LineChart, desc: "Plot functions, pan, zoom" },
    { id: "matrix", name: "Matrix Solver", icon: Grid3x3, desc: "Solve Ax = b, determinant" },
    { id: "scientific", name: "Scientific", icon: Calculator, desc: "DEG/RAD calculator" },
    { id: "converter", name: "Unit Converter", icon: Ruler, desc: "Length, mass, time…" },
  ];
  const [active, setActive] = useState("graphing");

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[#c4f000] uppercase tracking-widest mb-1">// interactive tools</div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sigma className="h-7 w-7" />
            tools
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">calculators, solvers, and converters. all in your browser.</p>
        </div>
      </div>

      <div className="grid gap-px bg-zinc-800/60 border border-zinc-800/60 grid-cols-2 sm:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "p-4 text-left transition-colors",
                active === t.id ? "bg-[#0d0d0d]" : "bg-[#0a0a0a] hover:bg-[#0d0d0d]"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={cn("h-4 w-4", active === t.id ? "text-[#c4f000]" : "text-zinc-500")} />
                <span className={cn("font-semibold text-sm", active === t.id ? "text-zinc-100" : "text-zinc-300")}>{t.name}</span>
              </div>
              <p className="text-xs text-zinc-500">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {active === "graphing" && <GraphingCalculator />}
        {active === "matrix" && <MatrixSolver />}
        {active === "scientific" && <ScientificCalculator />}
        {active === "converter" && <UnitConverter />}
      </div>
    </div>
  );
}
