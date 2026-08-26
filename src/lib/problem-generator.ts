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

// === WORD PROBLEMS ===
const wordProblemsEasy: Generator[] = [
  (rng) => {
    const itemPrice = randInt(rng, 2, 8);
    const quantity = randInt(rng, 3, 9);
    const total = itemPrice * quantity;
    return {
      id: `wp-e1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `If apples cost $${itemPrice} each, how much do ${quantity} apples cost?`,
      answer: total,
      choices: generateChoices(rng, total, 4, 0.2),
      explanation: `Total = price × quantity = $${itemPrice} × ${quantity} = $${total}.`,
      xp: 10,
      hint: `Multiply the price per apple by the number of apples.`,
    };
  },
  (rng) => {
    const total = randInt(rng, 20, 100);
    const groups = randInt(rng, 2, 8);
    return {
      id: `wp-e2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `${total} cookies are split equally among ${groups} friends. How many does each get?`,
      answer: Math.floor(total / groups),
      choices: generateChoices(rng, Math.floor(total / groups), 4, 0.2),
      explanation: `Each friend gets ${total} ÷ ${groups} = ${Math.floor(total / groups)} cookies.`,
      xp: 10,
      hint: `Divide the total by the number of friends.`,
    };
  },
  (rng) => {
    const start = randInt(rng, 20, 80);
    const hours = randInt(rng, 2, 5);
    const rate = randInt(rng, 3, 10);
    const final = start + hours * rate;
    return {
      id: `wp-e3-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `A tank has ${start} gallons. Water flows in at ${rate} gallons per hour. How many gallons after ${hours} hours?`,
      answer: final,
      choices: generateChoices(rng, final, 4, 0.2),
      explanation: `Final = ${start} + (${rate} × ${hours}) = ${start} + ${hours * rate} = ${final} gallons.`,
      xp: 10,
      hint: `Add the starting amount to the total water added.`,
    };
  },
  (rng) => {
    const distance = randInt(rng, 60, 240);
    const time = randInt(rng, 2, 4);
    return {
      id: `wp-e4-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "easy",
      question: `A car travels ${distance} miles in ${time} hours. What's the average speed (mph)?`,
      answer: Math.floor(distance / time),
      choices: generateChoices(rng, Math.floor(distance / time), 4, 0.2),
      explanation: `Speed = distance ÷ time = ${distance} ÷ ${time} = ${Math.floor(distance / time)} mph.`,
      xp: 10,
      hint: `Speed = distance / time.`,
    };
  },
];

const wordProblemsMedium: Generator[] = [
  (rng) => {
    const originalPrice = randInt(rng, 40, 150);
    const discountPct = randInt(rng, 10, 40);
    const discount = Math.round(originalPrice * discountPct / 100);
    const salePrice = originalPrice - discount;
    return {
      id: `wp-m1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `A $${originalPrice} jacket is ${discountPct}% off. What's the sale price?`,
      answer: salePrice,
      choices: generateChoices(rng, salePrice, 4, 0.1),
      explanation: `Discount = $${originalPrice} × ${discountPct}/100 = $${discount}. Sale price = $${originalPrice} - $${discount} = $${salePrice}.`,
      xp: 15,
      hint: `First calculate the discount, then subtract from the original price.`,
    };
  },
  (rng) => {
    const principal = randInt(rng, 500, 2000);
    const years = randInt(rng, 2, 5);
    const total = principal * Math.pow(1.05, years);
    const answer = Math.round(total);
    return {
      id: `wp-m2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `$${principal} invested at 5% annual compound interest. What's the value after ${years} years? (round to nearest dollar)`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.1),
      explanation: `A = P(1 + r)^t = $${principal} × (1.05)^${years} = $${principal} × ${Math.pow(1.05, years).toFixed(3)} ≈ $${answer}.`,
      xp: 15,
      hint: `Compound interest formula: A = P(1 + r)^t.`,
    };
  },
  (rng) => {
    const start = randInt(rng, 50, 200);
    const rate = randInt(rng, 2, 8);
    const t = randInt(rng, 3, 6);
    const final = Math.round(start * Math.pow(1 + rate / 100, t));
    return {
      id: `wp-m3-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `A population of ${start} grows at ${rate}% per year. What's the population after ${t} years? (round to nearest whole)`,
      answer: final,
      choices: generateChoices(rng, final, 4, 0.1),
      explanation: `P(t) = P₀ × (1 + r)^t = ${start} × (1.${rate})^${t} ≈ ${final}.`,
      xp: 15,
      hint: `Exponential growth: P(t) = P₀(1 + r)^t.`,
    };
  },
  (rng) => {
    const length = randInt(rng, 8, 20);
    const width = randInt(rng, 5, 12);
    const fenceCost = randInt(rng, 5, 20);
    const perimeter = 2 * (length + width);
    const totalCost = perimeter * fenceCost;
    return {
      id: `wp-m4-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "arithmetic",
      difficulty: "medium",
      question: `A ${length}×${width} garden needs fencing on all four sides. Fencing costs $${fenceCost} per meter. What's the total cost?`,
      answer: totalCost,
      choices: generateChoices(rng, totalCost, 4, 0.1),
      explanation: `Perimeter = 2(${length} + ${width}) = ${perimeter} m. Total = ${perimeter} × $${fenceCost} = $${totalCost}.`,
      xp: 15,
      hint: `Find the perimeter, then multiply by cost per meter.`,
    };
  },
];

const wordProblemsHard: Generator[] = [
  (rng) => {
    const adult = randInt(rng, 12, 25);
    const child = randInt(rng, adult * 2, adult * 4);
    const adultPrice = randInt(rng, 15, 30);
    const childPrice = Math.round(adultPrice * 0.5);
    const total = adult * adultPrice + child * childPrice;
    return {
      id: `wp-h1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "hard",
      question: `${adult} adults and ${child} children go to a show. Adult tickets cost $${adultPrice}, child tickets $${childPrice}. What's the total?`,
      answer: total,
      choices: generateChoices(rng, total, 4, 0.1),
      explanation: `Adults: ${adult} × $${adultPrice} = $${adult * adultPrice}. Children: ${child} × $${childPrice} = $${child * childPrice}. Total: $${total}.`,
      xp: 20,
      hint: `Calculate adult total + child total separately.`,
    };
  },
  (rng) => {
    const length = randInt(rng, 10, 25);
    const width = randInt(rng, 6, 15);
    const depth = randInt(rng, 2, 5);
    const flowRate = randInt(rng, 5, 20);
    const volume = length * width * depth;
    const fillTime = Math.round(volume / flowRate);
    return {
      id: `wp-h2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "algebra",
      difficulty: "hard",
      question: `A pool is ${length}×${width}×${depth} meters. Water flows in at ${flowRate} m³/min. How many minutes to fill? (round to nearest whole)`,
      answer: fillTime,
      choices: generateChoices(rng, fillTime, 4, 0.1),
      explanation: `Volume = ${length} × ${width} × ${depth} = ${volume} m³. Time = ${volume} ÷ ${flowRate} = ${fillTime} minutes.`,
      xp: 20,
      hint: `Volume = length × width × depth. Then divide by flow rate.`,
    };
  },
];

// === COMBINATORICS & SEQUENCES ===
const combinatoricsEasy: Generator[] = [
  (rng) => {
    const n = randInt(rng, 4, 10);
    const r = randInt(rng, 2, Math.min(n, 4));
    let perm = 1;
    for (let i = 0; i < r; i++) perm *= (n - i);
    return {
      id: `comb-e1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "combinatorics",
      difficulty: "easy",
      question: `How many ways can you arrange ${r} items from ${n} distinct items? (permutations, no repetition)`,
      answer: perm,
      choices: generateChoices(rng, perm, 4, 0.3),
      explanation: `${n}P${r} = ${n}! / (${n - r})! = ${perm}.`,
      xp: 10,
      hint: `${n}P${r} = ${n} × (${n - 1}) × ... × (${n - r + 1}).`,
    };
  },
  (rng) => {
    const n = randInt(rng, 5, 10);
    const r = randInt(rng, 2, 4);
    const fact = (k: number): number => k <= 1 ? 1 : k * fact(k - 1);
    const comb = fact(n) / (fact(r) * fact(n - r));
    return {
      id: `comb-e2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "combinatorics",
      difficulty: "easy",
      question: `From ${n} students, how many ways to choose a committee of ${r}?`,
      answer: Math.round(comb),
      choices: generateChoices(rng, Math.round(comb), 4, 0.3),
      explanation: `C(${n}, ${r}) = ${n}! / (${r}! × (${n - r})!) = ${Math.round(comb)}.`,
      xp: 10,
      hint: `Use the combination formula: C(n, r) = n! / (r! × (n−r)!).`,
    };
  },
];

const sequencesEasy: Generator[] = [
  (rng) => {
    const a1 = randInt(rng, 2, 10);
    const d = randInt(rng, 1, 8);
    const n = randInt(rng, 10, 20);
    const answer = a1 + (n - 1) * d;
    return {
      id: `seq-e1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "sequences",
      difficulty: "easy",
      question: `Arithmetic sequence: first term ${a1}, common difference ${d}. Find the ${n}th term.`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `a_n = a_1 + (n-1)d = ${a1} + (${n - 1})(${d}) = ${a1} + ${(n - 1) * d} = ${answer}.`,
      xp: 10,
      hint: `a_n = a_1 + (n-1)d.`,
    };
  },
  (rng) => {
    const a1 = randInt(rng, 2, 5);
    const r = randInt(rng, 2, 4);
    const n = randInt(rng, 5, 8);
    const answer = a1 * Math.pow(r, n - 1);
    return {
      id: `seq-e2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "sequences",
      difficulty: "easy",
      question: `Geometric sequence: first term ${a1}, common ratio ${r}. Find the ${n}th term.`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.2),
      explanation: `a_n = a_1 × r^(n-1) = ${a1} × ${r}^(${n - 1}) = ${a1} × ${Math.pow(r, n - 1)} = ${answer}.`,
      xp: 10,
      hint: `a_n = a_1 × r^(n-1).`,
    };
  },
];

const sequencesMedium: Generator[] = [
  (rng) => {
    const a1 = randInt(rng, 1, 5);
    const r = randInt(rng, 2, 5);
    const n = randInt(rng, 5, 8);
    const sum = a1 * (Math.pow(r, n) - 1) / (r - 1);
    return {
      id: `seq-m1-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "sequences",
      difficulty: "medium",
      question: `Sum of first ${n} terms of geometric series: first term ${a1}, ratio ${r}.`,
      answer: Math.round(sum),
      choices: generateChoices(rng, Math.round(sum), 4, 0.2),
      explanation: `S_n = a_1(r^n - 1)/(r-1) = ${a1}(${Math.pow(r, n)} - 1)/(${r - 1}) = ${Math.round(sum)}.`,
      xp: 15,
      hint: `S_n = a_1(r^n - 1)/(r-1).`,
    };
  },
  (rng) => {
    const n = randInt(rng, 20, 50);
    const answer = n * (n + 1) / 2;
    return {
      id: `seq-m2-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      topic: "sequences",
      difficulty: "medium",
      question: `Sum of the first ${n} positive integers?`,
      answer,
      choices: generateChoices(rng, answer, 4, 0.1),
      explanation: `S = n(n+1)/2 = ${n}(${n + 1})/2 = ${answer}.`,
      xp: 10,
      hint: `Gauss's formula: S = n(n+1)/2.`,
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
  "word-problems": { easy: wordProblemsEasy, medium: wordProblemsMedium, hard: wordProblemsHard },
  combinatorics: { easy: combinatoricsEasy, medium: [], hard: [] },
  sequences: { easy: sequencesEasy, medium: sequencesMedium, hard: [] },
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
