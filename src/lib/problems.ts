export type ProblemDifficulty = "easy" | "medium" | "hard";

export type TestCase = {
  input: Record<string, unknown>;
  expected: unknown;
  hidden?: boolean;
};

export type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
  xp: number;
  acceptance: number;
  totalSolved: number;
};

export const problems: Problem[] = [
  // === ALGEBRA ===
  {
    id: "alg-001",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    topic: "algebra",
    tags: ["arithmetic", "fundamentals"],
    description:
      "Given an array of integers and a target sum, return the indices of the two numbers that add up to the target. Assume exactly one solution exists.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "Only one valid answer exists",
    ],
    starterCode: `function twoSum(nums, target) {
  // your code here
  return [];
}`,
    functionName: "twoSum",
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    xp: 10,
    acceptance: 54.2,
    totalSolved: 12834,
  },
  {
    id: "alg-002",
    slug: "reverse-integer",
    title: "Reverse Integer",
    difficulty: "medium",
    topic: "algebra",
    tags: ["arithmetic", "overflow"],
    description:
      "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, return 0.",
    examples: [
      { input: "x = 123", output: "321" },
      { input: "x = -123", output: "-321" },
      { input: "x = 120", output: "21" },
    ],
    constraints: [
      "-2³¹ ≤ x ≤ 2³¹ - 1",
    ],
    starterCode: `function reverse(x) {
  // your code here
  return 0;
}`,
    functionName: "reverse",
    testCases: [
      { input: { x: 123 }, expected: 321 },
      { input: { x: -123 }, expected: -321 },
      { input: { x: 120 }, expected: 21 },
      { input: { x: 1534236469 }, expected: 0 },
    ],
    xp: 15,
    acceptance: 29.4,
    totalSolved: 8921,
  },
  {
    id: "alg-003",
    slug: "quadratic-roots",
    title: "Quadratic Roots",
    difficulty: "easy",
    topic: "algebra",
    tags: ["equations", "formulas"],
    description:
      "Given coefficients a, b, c of a quadratic equation ax² + bx + c = 0, return its two real roots in ascending order. Round to 2 decimal places. Assume a ≠ 0 and discriminant ≥ 0.",
    examples: [
      { input: "a=1, b=-5, c=6", output: "[2, 3]", explanation: "x² - 5x + 6 = (x-2)(x-3)" },
      { input: "a=1, b=0, c=-4", output: "[-2, 2]" },
    ],
    constraints: [
      "a ≠ 0",
      "b² - 4ac ≥ 0",
      "-1000 ≤ a, b, c ≤ 1000",
    ],
    starterCode: `function quadraticRoots(a, b, c) {
  // your code here
  return [0, 0];
}`,
    functionName: "quadraticRoots",
    testCases: [
      { input: { a: 1, b: -5, c: 6 }, expected: [2, 3] },
      { input: { a: 1, b: 0, c: -4 }, expected: [-2, 2] },
      { input: { a: 2, b: -7, c: 3 }, expected: [0.5, 3] },
    ],
    xp: 10,
    acceptance: 62.1,
    totalSolved: 6234,
  },
  {
    id: "alg-004",
    slug: "polynomial-derivative",
    title: "Polynomial Derivative",
    difficulty: "medium",
    topic: "algebra",
    tags: ["calculus", "polynomials"],
    description:
      "Given a polynomial as an array of coefficients [a₀, a₁, a₂, ...] where P(x) = a₀ + a₁x + a₂x² + ..., return the coefficients of its derivative.",
    examples: [
      { input: "[1, 2, 3]", output: "[2, 6]", explanation: "P(x) = 1 + 2x + 3x², P'(x) = 2 + 6x" },
      { input: "[5, 0, 0, 1]", output: "[0, 0, 3]" },
    ],
    constraints: [
      "1 ≤ coefficients.length ≤ 100",
      "-1000 ≤ coefficients[i] ≤ 1000",
    ],
    starterCode: `function derivative(coefficients) {
  // your code here
  return [];
}`,
    functionName: "derivative",
    testCases: [
      { input: { coefficients: [1, 2, 3] }, expected: [2, 6] },
      { input: { coefficients: [5, 0, 0, 1] }, expected: [0, 0, 3] },
      { input: { coefficients: [10] }, expected: [] },
    ],
    xp: 15,
    acceptance: 71.8,
    totalSolved: 4521,
  },

  // === ARITHMETIC ===
  {
    id: "ari-001",
    slug: "factorial",
    title: "Factorial",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["recursion", "loops"],
    description: "Compute n! (n factorial). 0! = 1.",
    examples: [
      { input: "n = 5", output: "120" },
      { input: "n = 0", output: "1" },
    ],
    constraints: ["0 ≤ n ≤ 12"],
    starterCode: `function factorial(n) {
  // your code here
  return 0;
}`,
    functionName: "factorial",
    testCases: [
      { input: { n: 5 }, expected: 120 },
      { input: { n: 0 }, expected: 1 },
      { input: { n: 10 }, expected: 3628800 },
    ],
    xp: 10,
    acceptance: 85.3,
    totalSolved: 15432,
  },
  {
    id: "ari-002",
    slug: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["recursion", "memoization"],
    description: "Return the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
    examples: [
      { input: "n = 2", output: "1" },
      { input: "n = 10", output: "55" },
    ],
    constraints: ["0 ≤ n ≤ 30"],
    starterCode: `function fib(n) {
  // your code here
  return 0;
}`,
    functionName: "fib",
    testCases: [
      { input: { n: 0 }, expected: 0 },
      { input: { n: 1 }, expected: 1 },
      { input: { n: 10 }, expected: 55 },
    ],
    xp: 10,
    acceptance: 72.4,
    totalSolved: 18923,
  },
  {
    id: "ari-003",
    slug: "gcd",
    title: "Greatest Common Divisor",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["euclidean", "recursion"],
    description: "Compute the greatest common divisor of two non-negative integers using the Euclidean algorithm.",
    examples: [
      { input: "a = 12, b = 18", output: "6" },
      { input: "a = 0, b = 5", output: "5" },
    ],
    constraints: ["0 ≤ a, b ≤ 10⁹"],
    starterCode: `function gcd(a, b) {
  // your code here
  return 0;
}`,
    functionName: "gcd",
    testCases: [
      { input: { a: 12, b: 18 }, expected: 6 },
      { input: { a: 0, b: 5 }, expected: 5 },
      { input: { a: 100, b: 75 }, expected: 25 },
    ],
    xp: 10,
    acceptance: 68.9,
    totalSolved: 9456,
  },
  {
    id: "ari-004",
    slug: "prime-check",
    title: "Prime Number Check",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["primes", "number-theory"],
    description: "Return true if n is a prime number, false otherwise.",
    examples: [
      { input: "n = 7", output: "true" },
      { input: "n = 12", output: "false" },
    ],
    constraints: ["0 ≤ n ≤ 10⁶"],
    starterCode: `function isPrime(n) {
  // your code here
  return false;
}`,
    functionName: "isPrime",
    testCases: [
      { input: { n: 7 }, expected: true },
      { input: { n: 12 }, expected: false },
      { input: { n: 1 }, expected: false },
      { input: { n: 97 }, expected: true },
    ],
    xp: 10,
    acceptance: 58.7,
    totalSolved: 11234,
  },

  // === GEOMETRY ===
  {
    id: "geo-001",
    slug: "circle-area",
    title: "Circle Area",
    difficulty: "easy",
    topic: "geometry",
    tags: ["circles", "formulas"],
    description: "Given a radius, return the area of the circle. Use π = 3.14159.",
    examples: [
      { input: "r = 5", output: "78.54" },
      { input: "r = 0", output: "0" },
    ],
    constraints: ["0 ≤ r ≤ 10⁴"],
    starterCode: `function circleArea(r) {
  // your code here
  return 0;
}`,
    functionName: "circleArea",
    testCases: [
      { input: { r: 5 }, expected: 78.54 },
      { input: { r: 0 }, expected: 0 },
      { input: { r: 1 }, expected: 3.14 },
    ],
    xp: 10,
    acceptance: 88.1,
    totalSolved: 19876,
  },
  {
    id: "geo-002",
    slug: "pythagorean-triple",
    title: "Pythagorean Triple Check",
    difficulty: "easy",
    topic: "geometry",
    tags: ["triangles", "pythagoras"],
    description: "Given three positive integers a, b, c, return true if they form a Pythagorean triple (a² + b² = c², regardless of order).",
    examples: [
      { input: "a=3, b=4, c=5", output: "true" },
      { input: "a=1, b=2, c=3", output: "false" },
    ],
    constraints: ["1 ≤ a, b, c ≤ 1000"],
    starterCode: `function isPythagorean(a, b, c) {
  // your code here
  return false;
}`,
    functionName: "isPythagorean",
    testCases: [
      { input: { a: 3, b: 4, c: 5 }, expected: true },
      { input: { a: 1, b: 2, c: 3 }, expected: false },
      { input: { a: 5, b: 12, c: 13 }, expected: true },
    ],
    xp: 10,
    acceptance: 79.2,
    totalSolved: 13542,
  },
  {
    id: "geo-003",
    slug: "distance-formula",
    title: "Distance Between Two Points",
    difficulty: "easy",
    topic: "geometry",
    tags: ["coordinate-geometry", "pythagoras"],
    description: "Given two points (x1, y1) and (x2, y2), return the Euclidean distance between them. Round to 2 decimal places.",
    examples: [
      { input: "(0,0) and (3,4)", output: "5" },
      { input: "(1,1) and (4,5)", output: "5" },
    ],
    constraints: ["-1000 ≤ coordinates ≤ 1000"],
    starterCode: `function distance(x1, y1, x2, y2) {
  // your code here
  return 0;
}`,
    functionName: "distance",
    testCases: [
      { input: { x1: 0, y1: 0, x2: 3, y2: 4 }, expected: 5 },
      { input: { x1: 1, y1: 1, x2: 4, y2: 5 }, expected: 5 },
      { input: { x1: 0, y1: 0, x2: 0, y2: 0 }, expected: 0 },
    ],
    xp: 10,
    acceptance: 91.4,
    totalSolved: 16823,
  },

  // === STATISTICS ===
  {
    id: "sta-001",
    slug: "mean",
    title: "Mean of Array",
    difficulty: "easy",
    topic: "statistics",
    tags: ["descriptive-stats", "arrays"],
    description: "Given an array of numbers, return the arithmetic mean. Round to 2 decimal places.",
    examples: [
      { input: "[1, 2, 3, 4, 5]", output: "3" },
      { input: "[10, 20, 30]", output: "20" },
    ],
    constraints: ["1 ≤ length ≤ 10⁴"],
    starterCode: `function mean(arr) {
  // your code here
  return 0;
}`,
    functionName: "mean",
    testCases: [
      { input: { arr: [1, 2, 3, 4, 5] }, expected: 3 },
      { input: { arr: [10, 20, 30] }, expected: 20 },
      { input: { arr: [1, 2] }, expected: 1.5 },
    ],
    xp: 10,
    acceptance: 84.6,
    totalSolved: 14023,
  },
  {
    id: "sta-002",
    slug: "median",
    title: "Median of Array",
    difficulty: "medium",
    topic: "statistics",
    tags: ["descriptive-stats", "sorting"],
    description: "Return the median of an unsorted array of numbers. If even length, return the average of the two middle values.",
    examples: [
      { input: "[1, 3, 5]", output: "3" },
      { input: "[1, 2, 3, 4]", output: "2.5" },
    ],
    constraints: ["1 ≤ length ≤ 10⁵"],
    starterCode: `function median(arr) {
  // your code here
  return 0;
}`,
    functionName: "median",
    testCases: [
      { input: { arr: [1, 3, 5] }, expected: 3 },
      { input: { arr: [1, 2, 3, 4] }, expected: 2.5 },
      { input: { arr: [5, 2, 8, 1, 9] }, expected: 5 },
    ],
    xp: 15,
    acceptance: 61.3,
    totalSolved: 7821,
  },
  {
    id: "sta-003",
    slug: "standard-deviation",
    title: "Standard Deviation",
    difficulty: "hard",
    topic: "statistics",
    tags: ["variance", "spread"],
    description: "Calculate the population standard deviation. Round to 2 decimal places.",
    examples: [
      { input: "[2, 4, 4, 4, 5, 5, 7, 9]", output: "2.14" },
    ],
    constraints: ["1 ≤ length ≤ 10⁴"],
    starterCode: `function standardDeviation(arr) {
  // your code here
  return 0;
}`,
    functionName: "standardDeviation",
    testCases: [
      { input: { arr: [2, 4, 4, 4, 5, 5, 7, 9] }, expected: 2.14 },
      { input: { arr: [5, 5, 5, 5] }, expected: 0 },
      { input: { arr: [1, 2, 3] }, expected: 0.82 },
    ],
    xp: 25,
    acceptance: 42.7,
    totalSolved: 3421,
  },

  // === CALCULUS ===
  {
    id: "cal-001",
    slug: "power-derivative",
    title: "Power Rule Derivative",
    difficulty: "easy",
    topic: "calculus",
    tags: ["derivatives", "polynomials"],
    description: "Compute the derivative of x^n using the power rule. Return coefficient * n, exponent n-1.",
    examples: [
      { input: "coeff=3, n=2", output: "{coeff: 6, n: 1}", explanation: "d/dx(3x²) = 6x" },
      { input: "coeff=5, n=0", output: "{coeff: 0, n: 0}" },
    ],
    constraints: ["0 ≤ n ≤ 10"],
    starterCode: `function powerDerivative(coeff, n) {
  // your code here
  return { coeff: 0, n: 0 };
}`,
    functionName: "powerDerivative",
    testCases: [
      { input: { coeff: 3, n: 2 }, expected: { coeff: 6, n: 1 } },
      { input: { coeff: 5, n: 0 }, expected: { coeff: 0, n: 0 } },
      { input: { coeff: 7, n: 3 }, expected: { coeff: 21, n: 2 } },
    ],
    xp: 10,
    acceptance: 76.5,
    totalSolved: 8932,
  },
  {
    id: "cal-002",
    slug: "trapezoid-rule",
    title: "Numerical Integration (Trapezoid Rule)",
    difficulty: "hard",
    topic: "calculus",
    tags: ["integration", "numerical-methods"],
    description: "Approximate the integral of a function f over [a, b] using the trapezoid rule with n subintervals. Return value to 4 decimal places.",
    examples: [
      { input: "f(x)=x², a=0, b=1, n=100", output: "0.3334" },
    ],
    constraints: ["1 ≤ n ≤ 10000"],
    starterCode: `function trapezoidRule(a, b, n, f) {
  // f is a function: f(x) => number
  // your code here
  return 0;
}`,
    functionName: "trapezoidRule",
    testCases: [
      { input: { a: 0, b: 1, n: 100 }, expected: 0.3334 },
      { input: { a: 0, b: 1, n: 1000 }, expected: 0.3333 },
    ],
    xp: 30,
    acceptance: 31.2,
    totalSolved: 1847,
  },
];

export function getProblems(): Problem[] {
  return problems;
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return problems.find((p) => p.slug === slug);
}

export function getProblemsByTopic(topic: string): Problem[] {
  return problems.filter((p) => p.topic === topic);
}

export function getProblemsByDifficulty(difficulty: ProblemDifficulty): Problem[] {
  return problems.filter((p) => p.difficulty === difficulty);
}
