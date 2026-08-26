// Procedural problem generator — creates unlimited unique math problems
// Each generator produces problems with unique inputs, correct answers, and multiple-choice distractors.

export type GeneratedProblem = {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  answer: string | number;
  choices: string[];
  explanation: string;
  xp: number;
  hint: string;
};

type Generator = (rng: () => number) => GeneratedProblem;

function rngFromSeed(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function solveQuadratic(a: number, b: number, c: number): [number, number] | null {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const sqrtD = Math.sqrt(disc);
  const r1 = Math.round(((-b - sqrtD) / (2 * a)) * 100) / 100;
  const r2 = Math.round(((-b + sqrtD) / (2 * a)) * 100) / 100;
  return [Math.min(r1, r2), Math.max(r1, r2)];
}

function generateChoices(rng: () => number, correct: number, count = 4, spread = 0.1): string[] {
  const choices = new Set<string>([String(correct)]);
  let attempts = 0;
  while (choices.size < count && attempts < 50) {
    attempts++;
    const offset = (rng() - 0.5) * Math.abs(correct || 1) * spread * 2;
    const wrong = Math.round((correct + offset) * 10) / 10;
    if (wrong !== correct && !choices.has(String(wrong))) choices.add(String(wrong));
    const ratio = correct !== 0 ? correct * (0.8 + rng() * 0.4) : randInt(rng, 1, 10);
    const w2 = Math.round(ratio * 10) / 10;
    if (w2 !== correct && !choices.has(String(w2))) choices.add(String(w2));
  }
  while (choices.size < count) {
    const r = randInt(rng, -10, 20);
    if (!choices.has(String(r))) choices.add(String(r));
  }
  const arr = Array.from(choices);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// === ALGEBRA GENERATORS ===
const algebraEasy: Generator[] = [
  (rng) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, -10, 10);
    const x = randInt(rng, -5, 5);
    const c = a * x + b;
    return {
      id: `alg-e-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "easy",
      question: `Solve for x: ${a}x ${b >= 0 ? `+ ${b}` : `− ${-b}`} = ${c}`,
      answer: x,
      choices: generateChoices(rng, x, 4, 0.5),
      explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`,
      xp: 10,
      hint: `Isolate x by undoing the ${b >= 0 ? "addition" : "subtraction"} first, then divide by ${a}.`,
    };
  },
  (rng) => {
    const a = randInt(rng, 2, 12);
    const b = randInt(rng, 2, 12);
    const product = a * b;
    return {
      id: `alg-m-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "easy",
      question: `What is ${a} × ${b}?`,
      answer: product,
      choices: generateChoices(rng, product, 4, 0.3),
      explanation: `${a} × ${b} = ${a * b}.`,
      xp: 5,
      hint: `Try adding ${a} to itself ${b} times.`,
    };
  },
  (rng) => {
    const n = randInt(rng, 2, 8);
    const r = randInt(rng, 2, 5);
    const sum = (Math.pow(r, n) - 1) / (r - 1);
    return {
      id: `alg-q-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "medium",
      question: `What is 1 + ${r} + ${r * r} + ... (${n} terms, ratio ${r})?`,
      answer: sum,
      choices: generateChoices(rng, sum, 4, 0.2),
      explanation: `Geometric series: S = (r^n − 1) / (r − 1) = (${Math.pow(r, n)} − 1) / ${r - 1} = ${sum}.`,
      xp: 15,
      hint: `Geometric series: S = (r^n − 1) / (r − 1).`,
    };
  },
];

const algebraMedium: Generator[] = [
  (rng) => {
    const a = randInt(rng, 1, 5);
    const b = randInt(rng, -8, 8);
    const c = randInt(rng, -8, 8);
    const roots = solveQuadratic(a, b, c);
    if (!roots) {
      const a2 = 1, b2 = randInt(rng, 1, 10), c2 = randInt(rng, 1, 10);
      const r2 = solveQuadratic(a2, b2, c2);
      if (!r2) return algebraMedium[0](rng);
      return {
        id: `alg-q2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
        topic: "algebra",
        difficulty: "medium",
        question: `Solve for x: x² + ${b2}x + ${c2} = 0 (smaller root)`,
        answer: r2[0],
        choices: generateChoices(rng, r2[0], 4, 0.3),
        explanation: `Quadratic formula: x = (-b ± √(b²−4ac)) / 2a = (${-b2} ± √(${b2 * b2 - 4 * c2})) / 2. Smaller root: ${r2[0]}.`,
        xp: 15,
        hint: `Use x = (-b ± √(b²−4ac)) / 2a.`,
      };
    }
    return {
      id: `alg-q3-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "medium",
      question: `Solve for x: ${a}x² ${b >= 0 ? `+ ${b}x` : `− ${-b}x`} ${c >= 0 ? `+ ${c}` : `− ${-c}`} = 0 (smaller root)`,
      answer: roots[0],
      choices: generateChoices(rng, roots[0], 4, 0.3),
      explanation: `Discriminant = ${b * b - 4 * a * c}. Roots: ${roots.join(" and ")}.`,
      xp: 15,
      hint: `Use the quadratic formula.`,
    };
  },
  (rng) => {
    const a = randInt(rng, 2, 8);
    const x = randInt(rng, 1, 10);
    const b = randInt(rng, 1, 20);
    const answer = a * x + b;
    return {
      id: `alg-fn-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "medium",
      question: `If f(x) = ${a}x + ${b}, what is f(${x})?`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `f(${x}) = ${a}(${x}) + ${b} = ${a * x} + ${b} = ${answer}.`,
      xp: 10,
      hint: `Substitute x = ${x}: ${a} × ${x} + ${b}.`,
    };
  },
];

const algebraHard: Generator[] = [
  (rng) => {
    const a = randInt(rng, 1, 4);
    const b = randInt(rng, -8, 8);
    const c = randInt(rng, -8, 8);
    const roots = solveQuadratic(a, b, c);
    if (!roots) return algebraHard[0](rng);
    const sum = Math.round(-b / a * 100) / 100;
    return {
      id: `alg-v1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "hard",
      question: `Find the sum of the roots of: ${a}x² ${b >= 0 ? `+ ${b}x` : `− ${-b}x`} ${c >= 0 ? `+ ${c}` : `− ${-c}`} = 0`,
      answer: sum,
      choices: generateChoices(rng, sum, 4, 0.2),
      explanation: `By Vieta's formulas, sum of roots = −b/a = ${-b}/${a} = ${sum}.`,
      xp: 20,
      hint: `Vieta's formulas: sum of roots = −b/a.`,
    };
  },
  (rng) => {
    const a = randInt(rng, 1, 4);
    const b = randInt(rng, -8, 8);
    const c = randInt(rng, -8, 8);
    const roots = solveQuadratic(a, b, c);
    if (!roots) return algebraHard[0](rng);
    const product = Math.round(c / a * 100) / 100;
    return {
      id: `alg-v2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "hard",
      question: `Find the product of the roots of: ${a}x² ${b >= 0 ? `+ ${b}x` : `− ${-b}x`} ${c >= 0 ? `+ ${c}` : `− ${-c}`} = 0`,
      answer: product,
      choices: generateChoices(rng, product, 4, 0.2),
      explanation: `By Vieta's formulas, product of roots = c/a = ${c}/${a} = ${product}.`,
      xp: 20,
      hint: `Vieta's formulas: product of roots = c/a.`,
    };
  },
];

// === ARITHMETIC GENERATORS ===
const arithmeticEasy: Generator[] = [
  (rng) => {
    const a = randInt(rng, 50, 500);
    const b = randInt(rng, 20, 200);
    return {
      id: `ari-a-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `What is ${a} + ${b}?`,
      answer: a + b,
      choices: generateChoices(rng, a + b, 4, 0.1),
      explanation: `${a} + ${b} = ${a + b}.`,
      xp: 5,
      hint: `Add the ones digits, then the tens.`,
    };
  },
  (rng) => {
    const a = randInt(rng, 12, 48);
    const b = randInt(rng, 12, 36);
    return {
      id: `ari-b-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `What is ${a} × ${b}?`,
      answer: a * b,
      choices: generateChoices(rng, a * b, 4, 0.1),
      explanation: `${a} × ${b} = ${a * b}.`,
      xp: 5,
      hint: `Break it: ${a} × ${b} = ${a} × ${Math.floor(b / 2)} × 2 + ${a} × ${b % 2}.`,
    };
  },
];

const arithmeticMedium: Generator[] = [
  (rng) => {
    const a = randInt(rng, 100, 500);
    const b = randInt(rng, 3, 9);
    return {
      id: `ari-d-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `What is ${a} ÷ ${b}? (round to 1 decimal)`,
      answer: Math.round((a / b) * 10) / 10,
      choices: generateChoices(rng, Math.round((a / b) * 10) / 10, 4, 0.2),
      explanation: `${a} ÷ ${b} = ${(a / b).toFixed(1)}.`,
      xp: 10,
      hint: `Long division: how many times does ${b} go into ${a}?`,
    };
  },
  (rng) => {
    const num = randInt(rng, 2, 20);
    const den = randInt(rng, 2, 12);
    const g = gcd(num, den);
    return {
      id: `ari-f-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `Simplify ${num}/${den} to lowest terms.`,
      answer: `${num / g}/${den / g}`,
      choices: [`${num}/${den}`, `${num / g}/${den / g}`, `${den / g}/${num / g}`, `1/${den / num}`].slice(0, 4),
      explanation: `GCD(${num}, ${den}) = ${g}. Divide: ${num}÷${g} = ${num / g}, ${den}÷${g} = ${den / g}.`,
      xp: 10,
      hint: `Find the GCD of ${num} and ${den}, then divide both.`,
    };
  },
];

const arithmeticHard: Generator[] = [
  (rng) => {
    const p = randInt(rng, 20, 80);
    const n = randInt(rng, 50, 200);
    const answer = Math.round((p * n) / 100);
    return {
      id: `ari-p-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "hard",
      question: `What is ${p}% of ${n}?`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `${p}% of ${n} = (${p}/100) × ${n} = ${p * n / 100} ≈ ${answer}.`,
      xp: 15,
      hint: `Convert ${p}% to a decimal: ${(p / 100).toFixed(2)}. Then multiply by ${n}.`,
    };
  },
  (rng) => {
    const principal = randInt(rng, 500, 5000);
    const rate = randInt(rng, 3, 12);
    const years = randInt(rng, 2, 5);
    const interest = Math.round(principal * rate * years / 100);
    return {
      id: `ari-i-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "hard",
      question: `Simple interest on $${principal} at ${rate}% for ${years} years. Find the interest.`,
      answer: interest,
      choices: generateChoices(rng, interest, 4, 0.2),
      explanation: `I = P × r × t = ${principal} × 0.${rate.toString().padStart(2, "0")} × ${years} = $${interest}.`,
      xp: 15,
      hint: `I = P × r × t. r is the decimal rate.`,
    };
  },
];

// === GEOMETRY GENERATORS ===
const geometryEasy: Generator[] = [
  (rng) => {
    const w = randInt(rng, 3, 20);
    const h = randInt(rng, 3, 20);
    return {
      id: `geo-r-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "easy",
      question: `Area of a rectangle with width ${w} and height ${h}?`,
      answer: w * h,
      choices: generateChoices(rng, w * h, 4, 0.2),
      explanation: `Area = w × h = ${w} × ${h} = ${w * h}.`,
      xp: 5,
      hint: `Area of a rectangle = width × height.`,
    };
  },
  (rng) => {
    const a = randInt(rng, 3, 12);
    const b = randInt(rng, 4, 12);
    return {
      id: `geo-t-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "easy",
      question: `Area of a triangle with base ${b} and height ${a}?`,
      answer: (a * b) / 2,
      choices: generateChoices(rng, (a * b) / 2, 4, 0.2),
      explanation: `Area = ½ × base × height = ½ × ${b} × ${a} = ${(a * b) / 2}.`,
      xp: 5,
      hint: `Triangle area = ½ × base × height.`,
    };
  },
  (rng) => {
    const r = randInt(rng, 2, 15);
    return {
      id: `geo-c-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "easy",
      question: `Area of a circle with radius ${r}? (π ≈ 3.14)`,
      answer: Math.round(3.14 * r * r),
      choices: generateChoices(rng, Math.round(3.14 * r * r), 4, 0.2),
      explanation: `Area = πr² = 3.14 × ${r}² = 3.14 × ${r * r} ≈ ${Math.round(3.14 * r * r)}.`,
      xp: 5,
      hint: `Area of a circle = πr².`,
    };
  },
];

const geometryMedium: Generator[] = [
  (rng) => {
    const a = randInt(rng, 3, 12);
    const b = randInt(rng, 4, 12);
    const c = Math.sqrt(a * a + b * b);
    return {
      id: `geo-p-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "medium",
      question: `Right triangle with legs ${a} and ${b}. Find the hypotenuse (1 decimal).`,
      answer: Math.round(c * 10) / 10,
      choices: generateChoices(rng, Math.round(c * 10) / 10, 4, 0.2),
      explanation: `c = √(a² + b²) = √(${a * a} + ${b * b}) = √${a * a + b * b} ≈ ${Math.round(c * 10) / 10}.`,
      xp: 10,
      hint: `Pythagorean theorem: c² = a² + b².`,
    };
  },
  (rng) => {
    const r = randInt(rng, 3, 12);
    return {
      id: `geo-c2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "medium",
      question: `Circumference of a circle with radius ${r}? (π ≈ 3.14)`,
      answer: Math.round(2 * 3.14 * r * 10) / 10,
      choices: generateChoices(rng, Math.round(2 * 3.14 * r * 10) / 10, 4, 0.2),
      explanation: `C = 2πr = 2 × 3.14 × ${r} = ${(2 * 3.14 * r).toFixed(1)}.`,
      xp: 10,
      hint: `Circumference = 2πr.`,
    };
  },
  (rng) => {
    const n = randInt(rng, 3, 8);
    return {
      id: `geo-a-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "medium",
      question: `Sum of interior angles of a regular ${n}-sided polygon?`,
      answer: (n - 2) * 180,
      choices: generateChoices(rng, (n - 2) * 180, 4, 0.1),
      explanation: `Sum = (n − 2) × 180° = (${n} − 2) × 180° = ${(n - 2) * 180}°.`,
      xp: 10,
      hint: `Sum = (n − 2) × 180° where n is the number of sides.`,
    };
  },
];

const geometryHard: Generator[] = [
  (rng) => {
    const r = randInt(rng, 3, 10);
    const h = randInt(rng, 5, 15);
    const answer = Math.round((1 / 3) * 3.14 * r * r * h * 10) / 10;
    return {
      id: `geo-co-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "hard",
      question: `Volume of a cone: radius ${r}, height ${h}? (π ≈ 3.14)`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `V = (1/3)πr²h = (1/3) × 3.14 × ${r * r} × ${h} ≈ ${answer}.`,
      xp: 15,
      hint: `Cone volume = (1/3)πr²h.`,
    };
  },
  (rng) => {
    const r = randInt(rng, 3, 8);
    const answer = Math.round((4 / 3) * 3.14 * r * r * r * 10) / 10;
    return {
      id: `geo-sp-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "geometry",
      difficulty: "hard",
      question: `Volume of a sphere with radius ${r}? (π ≈ 3.14)`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `V = (4/3)πr³ = (4/3) × 3.14 × ${r * r * r} ≈ ${answer}.`,
      xp: 15,
      hint: `Sphere volume = (4/3)πr³.`,
    };
  },
];

// === STATISTICS GENERATORS ===
const statisticsEasy: Generator[] = [
  (rng) => {
    const arr: number[] = [];
    const n = randInt(rng, 4, 7);
    for (let i = 0; i < n; i++) arr.push(randInt(rng, 1, 20));
    const mean = Math.round((arr.reduce((a, b) => a + b, 0) / n) * 10) / 10;
    return {
      id: `sta-m-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "statistics",
      difficulty: "easy",
      question: `Mean of [${arr.join(", ")}]?`,
      answer: mean,
      choices: generateChoices(rng, mean, 4, 0.3),
      explanation: `Sum = ${arr.reduce((a, b) => a + b, 0)}, divided by ${n} = ${mean}.`,
      xp: 10,
      hint: `Add all numbers, then divide by count.`,
    };
  },
];

const statisticsMedium: Generator[] = [
  (rng) => {
    const arr: number[] = [];
    const n = randInt(rng, 5, 8);
    for (let i = 0; i < n; i++) arr.push(randInt(rng, 1, 30));
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    return {
      id: `sta-md-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "statistics",
      difficulty: "medium",
      question: `Median of [${arr.join(", ")}]?`,
      answer: mid,
      choices: generateChoices(rng, mid, 4, 0.3),
      explanation: `Sorted: [${sorted.join(", ")}]. Median: ${mid}.`,
      xp: 10,
      hint: `Sort, then find the middle.`,
    };
  },
  (rng) => {
    const n = randInt(rng, 4, 8);
    const answer = Math.round(n * (n + 1) / 2);
    return {
      id: `sta-s-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "statistics",
      difficulty: "medium",
      question: `Sum of the first ${n} positive integers?`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.1),
      explanation: `Sum = n(n+1)/2 = ${n}(${n + 1})/2 = ${answer}.`,
      xp: 10,
      hint: `Gauss's formula: n(n+1)/2.`,
    };
  },
];

const statisticsHard: Generator[] = [
  (rng) => {
    const arr: number[] = [];
    const n = randInt(rng, 4, 6);
    for (let i = 0; i < n; i++) arr.push(randInt(rng, 2, 12));
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const sd = Math.round(Math.sqrt(variance) * 100) / 100;
    return {
      id: `sta-sd-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "statistics",
      difficulty: "hard",
      question: `Population standard deviation of [${arr.join(", ")}]? (2 decimals)`,
      answer: sd,
      choices: generateChoices(rng, sd, 4, 0.2),
      explanation: `Mean = ${mean.toFixed(2)}, variance = ${variance.toFixed(2)}, σ ≈ ${sd}.`,
      xp: 20,
      hint: `1) Mean. 2) Squared deviations. 3) Average. 4) Square root.`,
    };
  },
];

// === CALCULUS GENERATORS ===
const calculusEasy: Generator[] = [
  (rng) => {
    const n = randInt(rng, 2, 8);
    const answer = n === 1 ? "1" : `${n}x^${n - 1}`;
    return {
      id: `cal-d-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "calculus",
      difficulty: "easy",
      question: `Derivative of x${n > 1 ? `^${n}` : ""}?`,
      answer,
      choices: n === 1
        ? ["1", `${n}x`, "0", `${n}x^${n - 1}`]
        : [`${n}x^${n - 1}`, `${n - 1}x^${n - 2}`, `${n}x`, `x^${n - 1}`],
      explanation: `Power rule: d/dx[x^n] = n·x^(n-1) = ${answer}.`,
      xp: 10,
      hint: `Power rule: d/dx[x^n] = n·x^(n-1).`,
    };
  },
  (rng) => {
    const a = randInt(rng, 2, 8);
    const b = randInt(rng, 1, 10);
    return {
      id: `cal-l-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "calculus",
      difficulty: "easy",
      question: `Derivative of ${a}x + ${b}?`,
      answer: a,
      choices: generateChoices(rng, a, 4, 0.3),
      explanation: `d/dx[${a}x + ${b}] = ${a}.`,
      xp: 10,
      hint: `Derivative of ax is a; derivative of a constant is 0.`,
    };
  },
];

const calculusMedium: Generator[] = [
  (rng) => {
    const a = randInt(rng, 2, 6);
    const b = randInt(rng, 1, 8);
    const c = randInt(rng, 0, 5);
    return {
      id: `cal-q-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "calculus",
      difficulty: "medium",
      question: `Derivative of f(x) = ${a}x² + ${b}x ${c >= 0 ? `+ ${c}` : `− ${-c}`}?`,
      answer: `${2 * a}x + ${b}`,
      choices: [`${2 * a}x + ${b}`, `${a}x² + ${b}`, `${2 * a}x`, `${a * 2}x² + ${b}`],
      explanation: `f'(x) = ${2 * a}x + ${b}.`,
      xp: 15,
      hint: `Power rule on each term.`,
    };
  },
  (rng) => {
    const n = randInt(rng, 2, 6);
    const answer = n === 1 ? "x²/2 + C" : `x^${n + 1}/${n + 1} + C`;
    return {
      id: `cal-i-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "calculus",
      difficulty: "medium",
      question: `∫x${n > 1 ? `^${n}` : ""} dx = ?`,
      answer,
      choices: n === 1
        ? ["x²/2 + C", `${n + 1}x^${n} + C`, `x + C`, `${n}x^${n - 1} + C`]
        : [`x^${n + 1}/${n + 1} + C`, `${n + 1}x^${n} + C`, `x^${n}/${n} + C`, `${n}x^${n - 1} + C`],
      explanation: `∫x^n dx = x^(n+1)/(n+1) + C = ${answer}.`,
      xp: 15,
      hint: `∫x^n dx = x^(n+1)/(n+1) + C.`,
    };
  },
];

const calculusHard: Generator[] = [
  (rng) => {
    const x = randInt(rng, 1, 5);
    const a = randInt(rng, 2, 5);
    const b = randInt(rng, 1, 10);
    const answer = 2 * a * x + b;
    return {
      id: `cal-f-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "calculus",
      difficulty: "hard",
      question: `If f(x) = ${a}x² + ${b}x, find f'(${x}).`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `f'(x) = ${2 * a}x + ${b}. At x=${x}: f'(${x}) = ${answer}.`,
      xp: 15,
      hint: `Differentiate, then substitute x = ${x}.`,
    };
  },
];

// === TRIGONOMETRY GENERATORS ===
const trigonometryEasy: Generator[] = [
  (rng) => {
    const a = randInt(rng, 3, 12);
    const b = randInt(rng, 4, 12);
    return {
      id: `tri-p-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "trigonometry",
      difficulty: "easy",
      question: `Right triangle with legs ${a} and ${b}. Hypotenuse? (1 decimal)`,
      answer: Math.round(Math.sqrt(a * a + b * b) * 10) / 10,
      choices: generateChoices(rng, Math.round(Math.sqrt(a * a + b * b) * 10) / 10, 4, 0.2),
      explanation: `c = √(a² + b²) = √(${a * a} + ${b * b}) ≈ ${Math.round(Math.sqrt(a * a + b * b) * 10) / 10}.`,
      xp: 10,
      hint: `Pythagorean theorem: c² = a² + b².`,
    };
  },
];

const trigonometryMedium: Generator[] = [
  (rng) => {
    const opp = randInt(rng, 3, 12);
    const adj = randInt(rng, 4, 12);
    const hyp = Math.sqrt(opp * opp + adj * adj);
    const sin = Math.round((opp / hyp) * 100) / 100;
    return {
      id: `tri-s-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "trigonometry",
      difficulty: "medium",
      question: `Right triangle: opposite = ${opp}, adjacent = ${adj}. Find sin(θ) (2 decimals).`,
      answer: sin,
      choices: generateChoices(rng, sin, 4, 0.3),
      explanation: `Hypotenuse = ${Math.round(hyp * 10) / 10}. sin(θ) = ${opp}/${Math.round(hyp * 10) / 10} ≈ ${sin}.`,
      xp: 10,
      hint: `sin(θ) = opposite/hypotenuse.`,
    };
  },
];

const trigonometryHard: Generator[] = [
  (rng) => {
    const angle = randInt(rng, 15, 75);
    const adjacent = randInt(rng, 5, 20);
    const angleRad = (angle * Math.PI) / 180;
    const hyp = Math.round(adjacent / Math.cos(angleRad));
    return {
      id: `tri-c-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "trigonometry",
      difficulty: "hard",
      question: `Right triangle: angle = ${angle}°, adjacent = ${adjacent}. Find hypotenuse.`,
      answer: hyp,
      choices: generateChoices(rng, hyp, 4, 0.2),
      explanation: `cos(${angle}°) = adjacent/hypotenuse, so hyp = ${adjacent}/cos(${angle}°) ≈ ${hyp}.`,
      xp: 15,
      hint: `cos(θ) = adjacent/hypotenuse.`,
    };
  },
];

const generatorsByTopic: Record<string, Record<string, Generator[]>> = {
  algebra: { easy: algebraEasy, medium: algebraMedium, hard: algebraHard },
  arithmetic: { easy: arithmeticEasy, medium: arithmeticMedium, hard: arithmeticHard },
  geometry: { easy: geometryEasy, medium: geometryMedium, hard: geometryHard },
  statistics: { easy: statisticsEasy, medium: statisticsMedium, hard: statisticsHard },
  calculus: { easy: calculusEasy, medium: calculusMedium, hard: calculusHard },
  trigonometry: { easy: trigonometryEasy, medium: trigonometryMedium, hard: trigonometryHard },
};

export type GenerationOptions = {
  topics?: string[];
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  count?: number;
  seed?: number;
};

export function generateProblems(opts: GenerationOptions = {}): GeneratedProblem[] {
  const { topics, difficulty = "mixed", count = 10, seed = Date.now() } = opts;
  const rng = rngFromSeed(seed);
  const selectedTopics = topics && topics.length > 0 ? topics : Object.keys(generatorsByTopic);
  const problems: GeneratedProblem[] = [];

  for (let i = 0; i < count; i++) {
    const topic = selectedTopics[Math.floor(rng() * selectedTopics.length)];
    const diff = difficulty === "mixed"
      ? (["easy", "medium", "hard"] as const)[Math.floor(rng() * 3)]
      : difficulty;
    const gens = generatorsByTopic[topic]?.[diff] || [];
    if (gens.length === 0) continue;
    const gen = gens[Math.floor(rng() * gens.length)];
    problems.push(gen(rng));
  }

  return problems;
}

export function generateDailyDrill(seed: number = Math.floor(Date.now() / 86400000)): GeneratedProblem[] {
  const rng = rngFromSeed(seed);
  const problems: GeneratedProblem[] = [];
  const config: [string, "easy" | "medium" | "hard"][] = [
    ["arithmetic", "easy"],
    ["arithmetic", "medium"],
    ["algebra", "medium"],
    ["geometry", "easy"],
    ["calculus", "hard"],
  ];
  for (const [topic, diff] of config) {
    const gens = generatorsByTopic[topic]?.[diff] || [];
    if (gens.length > 0) {
      problems.push(gens[Math.floor(rng() * gens.length)](rng));
    }
  }
  return problems;
}

export function generateQuiz(topic: string | "mixed", numQuestions: number = 10, difficulty: "easy" | "medium" | "hard" | "mixed" = "mixed"): GeneratedProblem[] {
  return generateProblems({
    topics: topic === "mixed" ? undefined : [topic],
    difficulty,
    count: numQuestions,
    seed: Date.now() + Math.floor(Math.random() * 100000),
  });
}
