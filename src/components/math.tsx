"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  tex: string;
  display?: boolean;
  className?: string;
};

// Simple LaTeX-to-Unicode renderer for common math notation
// Handles: ^, _, \frac, \sqrt, \pi, \theta, \alpha, etc.
function renderLatex(tex: string): string {
  let result = tex;

  // Fractions \frac{a}{b} -> (a)/(b)
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");

  // Square root \sqrt{x} -> √(x)
  result = result.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");

  // Trig functions
  result = result.replace(/\\sin/g, "sin");
  result = result.replace(/\\cos/g, "cos");
  result = result.replace(/\\tan/g, "tan");

  // Greek letters
  const greek: Record<string, string> = {
    "\\\\alpha": "α", "\\\\beta": "β", "\\\\gamma": "γ", "\\\\delta": "δ",
    "\\\\epsilon": "ε", "\\\\theta": "θ", "\\\\lambda": "λ", "\\\\mu": "μ",
    "\\\\pi": "π", "\\\\sigma": "σ", "\\\\tau": "τ", "\\\\phi": "φ",
    "\\\\omega": "ω", "\\\\Sigma": "Σ", "\\\\Pi": "Π", "\\\\Delta": "Δ",
    "\\\\Omega": "Ω", "\\\\Theta": "Θ", "\\\\Lambda": "Λ",
  };
  for (const [tex_, unicode] of Object.entries(greek)) {
    result = result.replace(new RegExp(tex_.replace(/\\\\/g, "\\\\"), "g"), unicode);
  }

  // Powers and subscripts
  result = result.replace(/\^2/g, "²");
  result = result.replace(/\^3/g, "³");
  result = result.replace(/\^4/g, "⁴");
  result = result.replace(/\^5/g, "⁵");
  result = result.replace(/\^6/g, "⁶");
  result = result.replace(/\^7/g, "⁷");
  result = result.replace(/\^8/g, "⁸");
  result = result.replace(/\^9/g, "⁹");
  result = result.replace(/\^0/g, "⁰");
  result = result.replace(/\^n/g, "ⁿ");
  result = result.replace(/\^\{([^}]+)\}/g, (_, p) => {
    return superscript(p);
  });

  result = result.replace(/_2/g, "₂");
  result = result.replace(/_3/g, "₃");
  result = result.replace(/_n/g, "ₙ");
  result = result.replace(/_\{([^}]+)\}/g, (_, p) => {
    return subscript(p);
  });

  // Relations
  result = result.replace(/\\leq/g, "≤");
  result = result.replace(/\\geq/g, "≥");
  result = result.replace(/\\neq/g, "≠");
  result = result.replace(/\\approx/g, "≈");
  result = result.replace(/\\pm/g, "±");
  result = result.replace(/\\times/g, "×");
  result = result.replace(/\\div/g, "÷");

  // Operators
  result = result.replace(/\\sum/g, "∑");
  result = result.replace(/\\int/g, "∫");
  result = result.replace(/\\infty/g, "∞");
  result = result.replace(/\\cdot/g, "·");

  // Clean up any remaining LaTeX
  result = result.replace(/\\\\/g, "");
  result = result.replace(/\\ /g, " ");
  result = result.replace(/\\,/g, "");

  return result;
}

function superscript(s: string): string {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵",
    "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    "n": "ⁿ", "i": "ⁱ", "x": "ˣ", "y": "ʸ",
  };
  return s.split("").map((c) => map[c] || c).join("");
}

function subscript(s: string): string {
  const map: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅",
    "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "n": "ₙ", "i": "ᵢ", "x": "ₓ", "y": "ᵧ",
  };
  return s.split("").map((c) => map[c] || c).join("");
}

export function Math({ tex, display, className }: Props) {
  const rendered = useMemo(() => renderLatex(tex), [tex]);

  if (display) {
    return (
      <div className={cn("text-center font-mono text-lg text-zinc-100 py-2", className)}>
        {rendered}
      </div>
    );
  }

  return <span className={cn("font-mono text-zinc-100", className)}>{rendered}</span>;
}
