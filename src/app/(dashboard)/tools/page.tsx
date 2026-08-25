"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluate } from "mathjs";
import { Calculator, Sigma, Grid3x3, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<string[]>([]);

  const buttons = [
    ["C", "(", ")", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "⌫", "="],
  ];

  const handleClick = (btn: string) => {
    if (btn === "C") {
      setDisplay("0");
    } else if (btn === "⌫") {
      setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
    } else if (btn === "=") {
      try {
        const expr = display.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
        const result = evaluate(expr);
        setHistory([`${display} = ${result}`, ...history].slice(0, 5));
        setDisplay(String(result));
      } catch {
        setDisplay("Error");
      }
    } else {
      setDisplay(display === "0" ? btn : display + btn);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Scientific Calculator</CardTitle>
          <CardDescription>Perform calculations with basic operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-muted p-4 text-right text-3xl font-mono">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((btn, i) => (
              <Button
                key={i}
                variant={btn === "=" ? "default" : btn.match(/[0-9.]/) ? "secondary" : "outline"}
                className="h-12 text-lg font-semibold"
                onClick={() => handleClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No calculations yet</p>
          ) : (
            <ul className="space-y-1 font-mono text-sm">
              {history.map((h, i) => (
                <li key={i} className="rounded bg-muted/50 px-2 py-1">{h}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function GraphingCalculator() {
  const [expr, setExpr] = useState("x^2");
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    try {
      const fn = (x: number) => evaluate(expr, { x });
      for (let x = -10; x <= 10; x += 0.5) {
        const y = fn(x);
        if (typeof y === "number" && isFinite(y)) {
          pts.push({ x, y: y as number });
        }
      }
      setPoints(pts);
    } catch {
      setPoints([]);
    }
  }, [expr]);

  const width = 500;
  const height = 400;
  const scaleX = width / 20;
  const scaleY = height / 20;
  const toPx = (x: number, y: number) => ({
    px: width / 2 + x * scaleX,
    py: height / 2 - y * scaleY,
  });

  const path = points
    .map((p, i) => {
      const { px, py } = toPx(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${px} ${py}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Graphing Calculator</CardTitle>
        <CardDescription>Plot functions of x</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <span className="flex items-center px-3 rounded-md bg-muted font-mono text-lg">y =</span>
          <Input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="font-mono text-lg"
            placeholder="x^2"
          />
        </div>
        <svg width={width} height={height} className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border">
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
          <path d={path} stroke="hsl(var(--primary))" fill="none" strokeWidth={2} />
        </svg>
        <p className="mt-2 text-sm text-muted-foreground">Try: x^2, sin(x), 2*x+1, sqrt(x)</p>
      </CardContent>
    </Card>
  );
}

export function MatrixCalculator() {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrix, setMatrix] = useState<string[][]>(() => [["1", "2"], ["3", "4"]]);

  const resetMatrix = () => {
    const next: string[][] = [];
    for (let r = 0; r < rows; r++) {
      next[r] = [];
      for (let c = 0; c < cols; c++) {
        next[r][c] = matrix[r]?.[c] ?? "0";
      }
    }
    setMatrix(next);
  };

  const updateCell = (r: number, c: number, val: string) => {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const getMinor = (m: number[][], r: number, c: number) => {
    const minor: number[][] = [];
    for (let i = 0; i < m.length; i++) {
      if (i === r) continue;
      const row: number[] = [];
      for (let j = 0; j < m[i].length; j++) {
        if (j === c) continue;
        row.push(m[i][j]);
      }
      minor.push(row);
    }
    return minor;
  };

  const determinant = (m: number[][]): number | null => {
    if (m.length === 0 || m[0].length === 0) return null;
    if (m.length !== m[0].length) return null;
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let c = 0; c < m[0].length; c++) {
      const sign = c % 2 === 0 ? 1 : -1;
      det += sign * m[0][c] * determinant(getMinor(m, 0, c))!;
    }
    return det;
  };

  const numericMatrix = matrix.map((row) => row.map((v) => parseFloat(v)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matrix Calculator</CardTitle>
        <CardDescription>Determinants & operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Rows</label>
            <Input type="number" value={rows} min={2} max={4} onChange={(e) => { setRows(Number(e.target.value)); }} className="w-16" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Cols</label>
            <Input type="number" value={cols} min={2} max={4} onChange={(e) => { setCols(Number(e.target.value)); }} className="w-16" />
          </div>
          <div className="flex items-end">
            <Button onClick={resetMatrix} variant="secondary" className="h-9 text-xs">Reset</Button>
          </div>
        </div>
        <div className="inline-block rounded-lg border-2 border-primary p-3">
          <div className="flex flex-col gap-2">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex gap-2">
                {Array.from({ length: cols }).map((_, c) => (
                  <Input
                    key={c}
                    value={matrix[r]?.[c] ?? "0"}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    className="w-16 text-center font-mono"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Determinant:</p>
          <p className="text-2xl font-bold font-mono">{rows === cols ? determinant(numericMatrix)?.toFixed(2) ?? "N/A" : "N/A (square matrix only)"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function UnitConverter() {
  const categories = {
    Length: { m: 1, km: 1000, cm: 0.01, ft: 0.3048, in: 0.0254, mi: 1609.34 },
    Mass: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
    Time: { s: 1, min: 60, hr: 3600, day: 86400 },
  };
  const [cat, setCat] = useState<keyof typeof categories>("Length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [val, setVal] = useState("1");

  const convert = () => {
    const units = categories[cat];
    const base = parseFloat(val) * units[from as keyof typeof units];
    const result = base / units[to as keyof typeof units];
    return isFinite(result) ? result.toFixed(4) : "Error";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
        <CardDescription>Convert between units</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <select value={cat} onChange={(e) => { setCat(e.target.value as keyof typeof categories); setFrom("m"); setTo("m"); }} className="w-full rounded-md border bg-background px-3 py-2">
            {Object.keys(categories).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Value" />
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border bg-background px-2">
              {Object.keys(categories[cat]).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="text-center text-2xl">=</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-lg">{convert()}</div>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border bg-background px-2">
              {Object.keys(categories[cat]).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  const tools = [
    { id: "scientific", name: "Scientific Calculator", icon: Calculator, desc: "Basic & scientific operations" },
    { id: "graphing", name: "Graphing Calculator", icon: Sigma, desc: "Plot functions visually" },
    { id: "matrix", name: "Matrix Calculator", icon: Grid3x3, desc: "Determinants & operations" },
    { id: "converter", name: "Unit Converter", icon: Ruler, desc: "Convert units easily" },
  ];
  const [active, setActive] = useState("scientific");

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Math Tools
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Interactive calculators & converters</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "text-left rounded-xl border p-4 transition-all hover:shadow-md",
                active === t.id ? "border-primary bg-primary/5" : "bg-card"
              )}
            >
              <Icon className={cn("h-6 w-6 mb-2", active === t.id ? "text-primary" : "text-muted-foreground")} />
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {active === "scientific" && <ScientificCalculator />}
      {active === "graphing" && <GraphingCalculator />}
      {active === "matrix" && <MatrixCalculator />}
      {active === "converter" && <UnitConverter />}
    </div>
  );
}
