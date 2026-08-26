"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2, Grid3x3, Sigma, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { matrix, multiply, inv, det, eigs, transpose, fraction, format } from "mathjs";

export function MatrixSolver() {
  const [size, setSize] = useState(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [4, 3, 2],
    [1, 1, 1],
    [2, 1, 3],
  ]);
  const [matrixB, setMatrixB] = useState<number[]>([10, 3, 7]);

  const setSizeN = (n: number) => {
    setSize(n);
    const newA = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => matrixA[r]?.[c] ?? 0)
    );
    const newB = Array.from({ length: n }, (_, i) => matrixB[i] ?? 0);
    setMatrixA(newA);
    setMatrixB(newB);
  };

  const updateCell = (r: number, c: number, v: number) => {
    setMatrixA((prev) => prev.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)));
  };
  const updateB = (i: number, v: number) => {
    setMatrixB((prev) => prev.map((x, j) => (i === j ? v : x)));
  };

  const result = useMemo(() => {
    try {
      const A = matrix(matrixA);
      const d = det(A);
      if (Math.abs(d as number) < 1e-10) {
        return { ok: false, error: "matrix is singular (determinant = 0)" };
      }
      const Ainv = inv(A);
      const x = multiply(Ainv, matrix(matrixB));
      const solution = (x.toArray() as number[][]).map((row) => row[0]);
      return {
        ok: true,
        determinant: d as number,
        inverse: (Ainv.toArray() as number[][]).map((row) => row.map((v) => v as number)),
        transpose: (transpose(A).toArray() as number[][]).map((row) => row.map((v) => v as number)),
        solution,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "computation failed" };
    }
  }, [matrixA, matrixB]);

  const randomize = () => {
    setMatrixA(
      Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * 20) - 10)
      )
    );
    setMatrixB(Array.from({ length: size }, () => Math.floor(Math.random() * 20) - 10));
  };

  const identity = () => {
    setMatrixA(
      Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) => (r === c ? 1 : 0))
      )
    );
    setMatrixB(Array.from({ length: size }, () => 0));
  };

  const clear = () => {
    setMatrixA(Array.from({ length: size }, () => Array.from({ length: size }, () => 0)));
    setMatrixB(Array.from({ length: size }, () => 0));
  };

  return (
    <div className="border border-zinc-800/60 bg-[#0d0d0d]">
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-semibold">Matrix Solver</span>
          <span className="text-[10px] text-zinc-600 font-mono">Ax = b</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setSizeN(n)}
              className={cn(
                "px-2.5 py-1 text-xs border transition-colors",
                size === n
                  ? "border-[#c4f000] text-[#c4f000] bg-[#c4f000]/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {n}×{n}
            </button>
          ))}
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <Button variant="ghost" size="sm" onClick={randomize} className="h-7 text-xs text-zinc-400 hover:text-zinc-100">random</Button>
          <Button variant="ghost" size="sm" onClick={identity} className="h-7 text-xs text-zinc-400 hover:text-zinc-100">identity</Button>
          <Button variant="ghost" size="sm" onClick={clear} className="h-7 text-xs text-zinc-400 hover:text-rose-400">clear</Button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Matrix input */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            {matrixA.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <Input
                    key={c}
                    type="number"
                    value={cell}
                    onChange={(e) => updateCell(r, c, parseFloat(e.target.value) || 0)}
                    className="w-14 h-10 bg-[#0a0a0a] border-zinc-800 text-zinc-100 text-center font-mono text-sm focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center text-2xl text-zinc-700 px-2 font-mono">×</div>
          <div className="flex flex-col gap-1 justify-center">
            {matrixB.map((v, i) => (
              <Input
                key={i}
                type="number"
                value={v}
                onChange={(e) => updateB(i, parseFloat(e.target.value) || 0)}
                className="w-14 h-10 bg-[#0a0a0a] border-zinc-800 text-zinc-100 text-center font-mono text-sm focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20"
              />
            ))}
          </div>
        </div>

        {/* Results */}
        {result.ok ? (
          <div className="space-y-4">
            <div className="border border-zinc-800/60 bg-[#0a0a0a] p-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-3">// solution x</div>
              <div className="space-y-1">
                {result.solution?.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-zinc-500 w-6">x{i + 1}</span>
                    <span className="text-zinc-300">=</span>
                    <span className="text-[#c4f000] font-semibold">{v.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="border border-zinc-800/60 bg-[#0a0a0a] p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-2">// determinant</div>
                <div className="text-xl font-mono font-bold text-zinc-100">{(result.determinant as number).toFixed(4)}</div>
              </div>
              <div className="border border-zinc-800/60 bg-[#0a0a0a] p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-2">// rank</div>
                <div className="text-xl font-mono font-bold text-zinc-100">
                  {Math.abs(result.determinant as number) > 1e-10 ? size : "≤" + (size - 1)}
                </div>
              </div>
              <div className="border border-zinc-800/60 bg-[#0a0a0a] p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-2">// condition</div>
                <div className="text-xl font-mono font-bold text-zinc-100">
                  {Math.abs(result.determinant as number) > 1 ? "well-cond" : "ill-cond"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-rose-500/30 bg-rose-500/5 p-4 text-rose-300 text-sm font-mono">
            error: {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
