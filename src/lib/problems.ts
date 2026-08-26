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

  // === MORE ALGEBRA ===
  {
    id: "alg-005",
    slug: "absolute-value",
    title: "Absolute Value Equation",
    difficulty: "easy",
    topic: "algebra",
    tags: ["equations", "absolute-value"],
    description: "Solve |x - 5| = 3. Return the solutions in ascending order as [smaller, larger].",
    examples: [
      { input: "|x - 5| = 3", output: "[2, 8]", explanation: "x - 5 = ±3, so x = 8 or x = 2" },
    ],
    constraints: ["exact integer solutions"],
    starterCode: `function solveAbsolute(a, b, c) {
  // solve |x - a| = b, return [smaller, larger]
  return [0, 0];
}`,
    functionName: "solveAbsolute",
    testCases: [
      { input: { a: 5, b: 3 }, expected: [2, 8] },
      { input: { a: 0, b: 5 }, expected: [-5, 5] },
      { input: { a: -3, b: 4 }, expected: [-7, 1] },
    ],
    xp: 10,
    acceptance: 71.2,
    totalSolved: 7821,
  },
  {
    id: "alg-006",
    slug: "system-of-equations",
    title: "System of Two Equations",
    difficulty: "medium",
    topic: "algebra",
    tags: ["systems", "substitution"],
    description: "Solve the system: a*x + b*y = e, c*x + d*y = f. Return x, then y (rounded to 2 decimal places).",
    examples: [
      { input: "2x + 3y = 13, x - y = 1", output: "x=3.20, y=2.20", explanation: "x=16/5=3.2, y=2.2" },
    ],
    constraints: ["unique solution exists"],
    starterCode: `function solve2x2(a, b, c, d, e, f) {
  // a*x + b*y = e
  // c*x + d*y = f
  return { x: 0, y: 0 };
}`,
    functionName: "solve2x2",
    testCases: [
      { input: { a: 2, b: 3, c: 1, d: -1, e: 13, f: 1 }, expected: { x: 3.2, y: 2.2 } },
      { input: { a: 1, b: 1, c: 1, d: -1, e: 10, f: 4 }, expected: { x: 7, y: 3 } },
      { input: { a: 3, b: 2, c: 1, d: 2, e: 7, f: 5 }, expected: { x: 1, y: 2 } },
    ],
    xp: 15,
    acceptance: 48.3,
    totalSolved: 5621,
  },
  {
    id: "alg-007",
    slug: "exponential-solve",
    title: "Exponential Equation",
    difficulty: "medium",
    topic: "algebra",
    tags: ["exponentials", "logarithms"],
    description: "Solve 2^x = n. Return x rounded to 3 decimal places.",
    examples: [
      { input: "2^x = 8", output: "x = 3.000" },
      { input: "2^x = 10", output: "x = 3.322" },
    ],
    constraints: ["n > 0"],
    starterCode: `function solveExp(n) {
  // solve 2^x = n, return x to 3 decimal places
  return 0;
}`,
    functionName: "solveExp",
    testCases: [
      { input: { n: 8 }, expected: 3.000 },
      { input: { n: 10 }, expected: 3.322 },
      { input: { n: 1 }, expected: 0.000 },
      { input: { n: 32 }, expected: 5.000 },
    ],
    xp: 15,
    acceptance: 42.1,
    totalSolved: 3892,
  },
  {
    id: "alg-008",
    slug: "logarithm",
    title: "Logarithm Base 10",
    difficulty: "easy",
    topic: "algebra",
    tags: ["logarithms"],
    description: "Compute log10(n) rounded to 3 decimal places.",
    examples: [
      { input: "n = 100", output: "2.000" },
      { input: "n = 1000", output: "3.000" },
    ],
    constraints: ["n > 0"],
    starterCode: `function log10(n) {
  return 0;
}`,
    functionName: "log10",
    testCases: [
      { input: { n: 100 }, expected: 2.000 },
      { input: { n: 1000 }, expected: 3.000 },
      { input: { n: 10 }, expected: 1.000 },
      { input: { n: 1 }, expected: 0.000 },
    ],
    xp: 10,
    acceptance: 81.3,
    totalSolved: 12034,
  },
  {
    id: "alg-009",
    slug: "completing-square",
    title: "Complete the Square",
    difficulty: "medium",
    topic: "algebra",
    tags: ["quadratics", "transformations"],
    description: "Rewrite ax² + bx + c in vertex form a(x - h)² + k. Return h and k to 2 decimal places.",
    examples: [
      { input: "x² + 6x + 5", output: "h=-3.00, k=-4.00", explanation: "x²+6x+9-4 = (x+3)²-4" },
    ],
    constraints: ["a ≠ 0"],
    starterCode: `function vertexForm(a, b, c) {
  // return { h, k } for a(x-h)^2 + k
  return { h: 0, k: 0 };
}`,
    functionName: "vertexForm",
    testCases: [
      { input: { a: 1, b: 6, c: 5 }, expected: { h: -3, k: -4 } },
      { input: { a: 2, b: -8, c: 3 }, expected: { h: 2, k: -5 } },
      { input: { a: -1, b: 4, c: 1 }, expected: { h: 2, k: 5 } },
    ],
    xp: 15,
    acceptance: 38.2,
    totalSolved: 4521,
  },
  {
    id: "alg-010",
    slug: "arithmetic-sequence-term",
    title: "Arithmetic Sequence - Nth Term",
    difficulty: "easy",
    topic: "algebra",
    tags: ["sequences"],
    description: "Given first term a1, common difference d, and term number n, return the nth term of an arithmetic sequence.",
    examples: [
      { input: "a1=3, d=4, n=10", output: "39", explanation: "a_n = 3 + 9·4 = 39" },
    ],
    constraints: ["n ≥ 1"],
    starterCode: `function nthTerm(a1, d, n) {
  return 0;
}`,
    functionName: "nthTerm",
    testCases: [
      { input: { a1: 3, d: 4, n: 10 }, expected: 39 },
      { input: { a1: 1, d: 1, n: 100 }, expected: 100 },
      { input: { a1: 10, d: -2, n: 5 }, expected: 2 },
    ],
    xp: 10,
    acceptance: 79.4,
    totalSolved: 9821,
  },
  {
    id: "alg-011",
    slug: "geometric-sum",
    title: "Geometric Series Sum",
    difficulty: "medium",
    topic: "algebra",
    tags: ["series", "sequences"],
    description: "Compute the sum of the first n terms of a geometric series: a + ar + ar² + ... + ar^(n-1). Return value rounded to 3 decimal places.",
    examples: [
      { input: "a=1, r=2, n=10", output: "1023.000", explanation: "1+2+4+...+512 = 2^10-1 = 1023" },
    ],
    constraints: ["r ≠ 1, n ≥ 1"],
    starterCode: `function geoSum(a, r, n) {
  return 0;
}`,
    functionName: "geoSum",
    testCases: [
      { input: { a: 1, r: 2, n: 10 }, expected: 1023 },
      { input: { a: 1, r: 0.5, n: 5 }, expected: 1.938 },
      { input: { a: 3, r: 3, n: 4 }, expected: 120 },
    ],
    xp: 15,
    acceptance: 51.7,
    totalSolved: 4892,
  },
  {
    id: "alg-012",
    slug: "inequality-solve",
    title: "Linear Inequality",
    difficulty: "easy",
    topic: "algebra",
    tags: ["inequalities"],
    description: "Solve ax + b > 0. Return the smallest integer x that satisfies the inequality. If no integer exists, return null.",
    examples: [
      { input: "2x + 3 > 0", output: "x = -1", explanation: "x > -1.5, smallest integer is -1" },
    ],
    constraints: ["a ≠ 0"],
    starterCode: `function solveInequality(a, b) {
  return 0;
}`,
    functionName: "solveInequality",
    testCases: [
      { input: { a: 2, b: 3 }, expected: -1 },
      { input: { a: -3, b: 10 }, expected: 3 },
      { input: { a: 5, b: -20 }, expected: 4 },
    ],
    xp: 10,
    acceptance: 73.8,
    totalSolved: 8921,
  },
  {
    id: "alg-013",
    slug: "word-problem-age",
    title: "Word Problem: Ages",
    difficulty: "medium",
    topic: "algebra",
    tags: ["word-problems", "systems"],
    description: "A father is 3 times as old as his son. In 12 years, he will be 1.5 times as old. Find the son's current age.",
    examples: [
      { input: "factor=3, futureFactor=1.5, years=12", output: "son = 12" },
    ],
    constraints: ["integer ages"],
    starterCode: `function solveAges(factor, futureFactor, years) {
  return 0;
}`,
    functionName: "solveAges",
    testCases: [
      { input: { factor: 3, futureFactor: 1.5, years: 12 }, expected: 12 },
      { input: { factor: 4, futureFactor: 2, years: 10 }, expected: 5 },
      { input: { factor: 2, futureFactor: 1.25, years: 15 }, expected: 15 },
    ],
    xp: 15,
    acceptance: 38.4,
    totalSolved: 6234,
  },
  {
    id: "alg-014",
    slug: "factoring-trinomial",
    title: "Factor Trinomial",
    difficulty: "easy",
    topic: "algebra",
    tags: ["factoring", "polynomials"],
    description: "Factor x² + bx + c into (x + m)(x + n). Return [m, n] where m ≤ n. Return both as integers, or null if not factorable over integers.",
    examples: [
      { input: "b=7, c=12", output: "[3, 4]", explanation: "x²+7x+12 = (x+3)(x+4)" },
    ],
    constraints: ["-100 ≤ b, c ≤ 100"],
    starterCode: `function factorTrinomial(b, c) {
  return null;
}`,
    functionName: "factorTrinomial",
    testCases: [
      { input: { b: 7, c: 12 }, expected: [3, 4] },
      { input: { b: -5, c: 6 }, expected: [2, 3] },
      { input: { b: 0, c: -9 }, expected: [-3, 3] },
      { input: { b: 1, c: 1 }, expected: null },
    ],
    xp: 10,
    acceptance: 64.2,
    totalSolved: 11234,
  },

  // === MORE ARITHMETIC ===
  {
    id: "ari-005",
    slug: "lcm",
    title: "Least Common Multiple",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["number-theory"],
    description: "Find the LCM of two positive integers.",
    examples: [
      { input: "a=4, b=6", output: "12" },
      { input: "a=12, b=18", output: "36" },
    ],
    constraints: ["1 ≤ a, b ≤ 10000"],
    starterCode: `function lcm(a, b) {
  return 0;
}`,
    functionName: "lcm",
    testCases: [
      { input: { a: 4, b: 6 }, expected: 12 },
      { input: { a: 12, b: 18 }, expected: 36 },
      { input: { a: 7, b: 5 }, expected: 35 },
      { input: { a: 100, b: 75 }, expected: 300 },
    ],
    xp: 10,
    acceptance: 67.4,
    totalSolved: 9218,
  },
  {
    id: "ari-006",
    slug: "sum-of-multiples",
    title: "Sum of Multiples",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["loops", "math"],
    description: "Find the sum of all multiples of k that are less than n.",
    examples: [
      { input: "k=3, n=10", output: "18", explanation: "3+6+9 = 18" },
    ],
    constraints: ["1 ≤ k < n ≤ 10000"],
    starterCode: `function sumMultiples(k, n) {
  return 0;
}`,
    functionName: "sumMultiples",
    testCases: [
      { input: { k: 3, n: 10 }, expected: 18 },
      { input: { k: 5, n: 20 }, expected: 30 },
      { input: { k: 7, n: 50 }, expected: 196 },
    ],
    xp: 10,
    acceptance: 75.8,
    totalSolved: 10234,
  },
  {
    id: "ari-007",
    slug: "digit-sum",
    title: "Sum of Digits",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["digits"],
    description: "Compute the sum of the digits of a positive integer.",
    examples: [
      { input: "n=123", output: "6" },
      { input: "n=9999", output: "36" },
    ],
    constraints: ["0 ≤ n ≤ 10^9"],
    starterCode: `function digitSum(n) {
  return 0;
}`,
    functionName: "digitSum",
    testCases: [
      { input: { n: 123 }, expected: 6 },
      { input: { n: 9999 }, expected: 36 },
      { input: { n: 1000 }, expected: 1 },
      { input: { n: 0 }, expected: 0 },
    ],
    xp: 10,
    acceptance: 89.2,
    totalSolved: 18421,
  },
  {
    id: "ari-008",
    slug: "perfect-numbers",
    title: "Perfect Number Check",
    difficulty: "medium",
    topic: "arithmetic",
    tags: ["number-theory", "divisors"],
    description: "A perfect number equals the sum of its proper divisors. Return true if n is a perfect number.",
    examples: [
      { input: "n=6", output: "true", explanation: "1+2+3=6" },
      { input: "n=28", output: "true", explanation: "1+2+4+7+14=28" },
    ],
    constraints: ["1 ≤ n ≤ 10000"],
    starterCode: `function isPerfect(n) {
  return false;
}`,
    functionName: "isPerfect",
    testCases: [
      { input: { n: 6 }, expected: true },
      { input: { n: 28 }, expected: true },
      { input: { n: 496 }, expected: true },
      { input: { n: 12 }, expected: false },
    ],
    xp: 15,
    acceptance: 52.1,
    totalSolved: 5892,
  },
  {
    id: "ari-009",
    slug: "percentage",
    title: "Percentage Calculation",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["percentages"],
    description: "What is p% of n? Return value rounded to 2 decimal places.",
    examples: [
      { input: "p=20, n=150", output: "30.00" },
    ],
    constraints: ["0 ≤ p ≤ 100"],
    starterCode: `function percentOf(p, n) {
  return 0;
}`,
    functionName: "percentOf",
    testCases: [
      { input: { p: 20, n: 150 }, expected: 30 },
      { input: { p: 15, n: 200 }, expected: 30 },
      { input: { p: 7.5, n: 80 }, expected: 6 },
    ],
    xp: 10,
    acceptance: 91.3,
    totalSolved: 22134,
  },
  {
    id: "ari-010",
    slug: "ratio",
    title: "Simplify Ratio",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["ratios"],
    description: "Simplify the ratio a:b to its lowest terms. Return [a', b'] where gcd(a', b') = 1.",
    examples: [
      { input: "a=12, b=18", output: "[2, 3]" },
    ],
    constraints: ["a, b > 0"],
    starterCode: `function simplifyRatio(a, b) {
  return [0, 0];
}`,
    functionName: "simplifyRatio",
    testCases: [
      { input: { a: 12, b: 18 }, expected: [2, 3] },
      { input: { a: 8, b: 12 }, expected: [2, 3] },
      { input: { a: 100, b: 75 }, expected: [4, 3] },
    ],
    xp: 10,
    acceptance: 83.4,
    totalSolved: 12034,
  },
  {
    id: "ari-011",
    slug: "prime-factors",
    title: "Prime Factorization",
    difficulty: "medium",
    topic: "arithmetic",
    tags: ["primes", "factorization"],
    description: "Return the prime factorization of n as an array of primes in ascending order. For n=1 return [].",
    examples: [
      { input: "n=12", output: "[2, 2, 3]" },
      { input: "n=60", output: "[2, 2, 3, 5]" },
    ],
    constraints: ["1 ≤ n ≤ 10^6"],
    starterCode: `function primeFactorize(n) {
  return [];
}`,
    functionName: "primeFactorize",
    testCases: [
      { input: { n: 12 }, expected: [2, 2, 3] },
      { input: { n: 60 }, expected: [2, 2, 3, 5] },
      { input: { n: 17 }, expected: [17] },
      { input: { n: 1 }, expected: [] },
    ],
    xp: 15,
    acceptance: 47.8,
    totalSolved: 6234,
  },
  {
    id: "ari-012",
    slug: "modular-arithmetic",
    title: "Modular Exponentiation",
    difficulty: "hard",
    topic: "arithmetic",
    tags: ["modular", "exponentiation"],
    description: "Compute (base^exp) % mod efficiently (no built-in powmod).",
    examples: [
      { input: "base=2, exp=10, mod=1000", output: "24" },
    ],
    constraints: ["0 ≤ base, exp < 10^9"],
    starterCode: `function powMod(base, exp, mod) {
  return 0;
}`,
    functionName: "powMod",
    testCases: [
      { input: { base: 2, exp: 10, mod: 1000 }, expected: 24 },
      { input: { base: 3, exp: 7, mod: 100 }, expected: 87 },
      { input: { base: 7, exp: 100, mod: 13 }, expected: 9 },
    ],
    xp: 25,
    acceptance: 31.4,
    totalSolved: 2891,
  },

  // === MORE GEOMETRY ===
  {
    id: "geo-004",
    slug: "triangle-area",
    title: "Triangle Area (base × height)",
    difficulty: "easy",
    topic: "geometry",
    tags: ["triangles", "area"],
    description: "Given base and height, compute the area of a triangle.",
    examples: [
      { input: "base=10, height=6", output: "30" },
    ],
    constraints: ["base, height > 0"],
    starterCode: `function triangleArea(base, height) {
  return 0;
}`,
    functionName: "triangleArea",
    testCases: [
      { input: { base: 10, height: 6 }, expected: 30 },
      { input: { base: 5, height: 8 }, expected: 20 },
      { input: { base: 3.5, height: 4 }, expected: 7 },
    ],
    xp: 10,
    acceptance: 92.1,
    totalSolved: 24891,
  },
  {
    id: "geo-005",
    slug: "rectangle-perimeter",
    title: "Rectangle Perimeter",
    difficulty: "easy",
    topic: "geometry",
    tags: ["rectangles", "perimeter"],
    description: "Compute the perimeter of a rectangle with given width and height.",
    examples: [
      { input: "w=5, h=3", output: "16" },
    ],
    constraints: ["w, h > 0"],
    starterCode: `function rectPerimeter(w, h) {
  return 0;
}`,
    functionName: "rectPerimeter",
    testCases: [
      { input: { w: 5, h: 3 }, expected: 16 },
      { input: { w: 10, h: 10 }, expected: 40 },
      { input: { w: 2.5, h: 4 }, expected: 13 },
    ],
    xp: 10,
    acceptance: 94.5,
    totalSolved: 26341,
  },
  {
    id: "geo-006",
    slug: "sphere-volume",
    title: "Sphere Volume",
    difficulty: "medium",
    topic: "geometry",
    tags: ["spheres", "volume"],
    description: "Compute the volume of a sphere with radius r. Round to 2 decimal places. Use π = 3.14159.",
    examples: [
      { input: "r=3", output: "113.10" },
    ],
    constraints: ["r > 0"],
    starterCode: `function sphereVolume(r) {
  return 0;
}`,
    functionName: "sphereVolume",
    testCases: [
      { input: { r: 3 }, expected: 113.10 },
      { input: { r: 1 }, expected: 4.19 },
      { input: { r: 5 }, expected: 523.60 },
    ],
    xp: 15,
    acceptance: 71.8,
    totalSolved: 9821,
  },
  {
    id: "geo-007",
    slug: "law-of-cosines",
    title: "Law of Cosines",
    difficulty: "hard",
    topic: "geometry",
    tags: ["triangles", "cosines"],
    description: "Given two sides a, b and the included angle C (in degrees), find the third side c. Round to 2 decimal places.",
    examples: [
      { input: "a=3, b=4, C=90", output: "5.00" },
    ],
    constraints: ["0 < C < 180"],
    starterCode: `function lawOfCosines(a, b, C) {
  // C in degrees
  return 0;
}`,
    functionName: "lawOfCosines",
    testCases: [
      { input: { a: 3, b: 4, C: 90 }, expected: 5 },
      { input: { a: 5, b: 7, C: 60 }, expected: 6.24 },
      { input: { a: 2, b: 3, C: 120 }, expected: 4.36 },
    ],
    xp: 25,
    acceptance: 42.3,
    totalSolved: 3892,
  },
  {
    id: "geo-008",
    slug: "polygon-area",
    title: "Regular Polygon Area",
    difficulty: "hard",
    topic: "geometry",
    tags: ["polygons", "area"],
    description: "Compute the area of a regular polygon with n sides and side length s. Round to 2 decimal places.",
    examples: [
      { input: "n=4, s=1 (square)", output: "1.00" },
      { input: "n=6, s=1 (hexagon)", output: "2.60" },
    ],
    constraints: ["n ≥ 3, s > 0"],
    starterCode: `function polygonArea(n, s) {
  return 0;
}`,
    functionName: "polygonArea",
    testCases: [
      { input: { n: 4, s: 1 }, expected: 1 },
      { input: { n: 6, s: 1 }, expected: 2.6 },
      { input: { n: 3, s: 2 }, expected: 1.73 },
    ],
    xp: 25,
    acceptance: 28.6,
    totalSolved: 2891,
  },
  {
    id: "geo-009",
    slug: "cone-volume",
    title: "Cone Volume",
    difficulty: "medium",
    topic: "geometry",
    tags: ["cones", "volume"],
    description: "Compute the volume of a cone: V = (1/3)πr²h. Round to 2 decimal places.",
    examples: [
      { input: "r=3, h=5", output: "47.12" },
    ],
    constraints: ["r, h > 0"],
    starterCode: `function coneVolume(r, h) {
  return 0;
}`,
    functionName: "coneVolume",
    testCases: [
      { input: { r: 3, h: 5 }, expected: 47.12 },
      { input: { r: 1, h: 1 }, expected: 1.05 },
      { input: { r: 2, h: 10 }, expected: 41.89 },
    ],
    xp: 15,
    acceptance: 68.4,
    totalSolved: 8921,
  },
  {
    id: "geo-010",
    slug: "midpoint",
    title: "Midpoint of Two Points",
    difficulty: "easy",
    topic: "geometry",
    tags: ["coordinate-geometry"],
    description: "Find the midpoint of two points (x1, y1) and (x2, y2). Return {x, y} to 2 decimal places.",
    examples: [
      { input: "(0,0) and (4,6)", output: "{x:2, y:3}" },
    ],
    constraints: ["any coordinates"],
    starterCode: `function midpoint(x1, y1, x2, y2) {
  return { x: 0, y: 0 };
}`,
    functionName: "midpoint",
    testCases: [
      { input: { x1: 0, y1: 0, x2: 4, y2: 6 }, expected: { x: 2, y: 3 } },
      { input: { x1: -2, y1: 4, x2: 6, y2: -2 }, expected: { x: 2, y: 1 } },
    ],
    xp: 10,
    acceptance: 88.1,
    totalSolved: 15234,
  },

  // === MORE STATISTICS ===
  {
    id: "sta-004",
    slug: "variance",
    title: "Population Variance",
    difficulty: "medium",
    topic: "statistics",
    tags: ["variance", "spread"],
    description: "Compute the population variance of an array. Round to 2 decimal places.",
    examples: [
      { input: "[2, 4, 4, 4, 5, 5, 7, 9]", output: "4.00" },
    ],
    constraints: ["1 ≤ length ≤ 10000"],
    starterCode: `function variance(arr) {
  return 0;
}`,
    functionName: "variance",
    testCases: [
      { input: { arr: [2, 4, 4, 4, 5, 5, 7, 9] }, expected: 4 },
      { input: { arr: [5, 5, 5, 5] }, expected: 0 },
      { input: { arr: [1, 2, 3] }, expected: 0.67 },
    ],
    xp: 15,
    acceptance: 55.2,
    totalSolved: 5892,
  },
  {
    id: "sta-005",
    slug: "mode",
    title: "Mode of Array",
    difficulty: "easy",
    topic: "statistics",
    tags: ["descriptive-stats"],
    description: "Return the most frequent value in the array. If multiple, return the smallest.",
    examples: [
      { input: "[1, 2, 2, 3, 3, 3, 4]", output: "3" },
    ],
    constraints: ["1 ≤ length ≤ 1000"],
    starterCode: `function mode(arr) {
  return 0;
}`,
    functionName: "mode",
    testCases: [
      { input: { arr: [1, 2, 2, 3, 3, 3, 4] }, expected: 3 },
      { input: { arr: [1, 1, 2, 2, 3, 3] }, expected: 1 },
      { input: { arr: [5, 5, 5, 1, 2] }, expected: 5 },
    ],
    xp: 10,
    acceptance: 72.3,
    totalSolved: 11234,
  },
  {
    id: "sta-006",
    slug: "permutation",
    title: "Permutation nPr",
    difficulty: "easy",
    topic: "statistics",
    tags: ["combinatorics"],
    description: "Compute n! / (n-r)! - the number of permutations of n items taken r at a time.",
    examples: [
      { input: "n=5, r=3", output: "60" },
    ],
    constraints: ["0 ≤ r ≤ n ≤ 20"],
    starterCode: `function nPr(n, r) {
  return 0;
}`,
    functionName: "nPr",
    testCases: [
      { input: { n: 5, r: 3 }, expected: 60 },
      { input: { n: 10, r: 4 }, expected: 5040 },
      { input: { n: 6, r: 0 }, expected: 1 },
    ],
    xp: 10,
    acceptance: 68.9,
    totalSolved: 9821,
  },
  {
    id: "sta-007",
    slug: "combination",
    title: "Combination nCr",
    difficulty: "medium",
    topic: "statistics",
    tags: ["combinatorics"],
    description: "Compute n! / (r! · (n-r)!) - the number of combinations of n items taken r at a time.",
    examples: [
      { input: "n=5, r=3", output: "10" },
    ],
    constraints: ["0 ≤ r ≤ n ≤ 20"],
    starterCode: `function nCr(n, r) {
  return 0;
}`,
    functionName: "nCr",
    testCases: [
      { input: { n: 5, r: 3 }, expected: 10 },
      { input: { n: 10, r: 4 }, expected: 210 },
      { input: { n: 6, r: 0 }, expected: 1 },
    ],
    xp: 15,
    acceptance: 61.4,
    totalSolved: 8234,
  },
  {
    id: "sta-008",
    slug: "binomial-probability",
    title: "Binomial Probability",
    difficulty: "hard",
    topic: "statistics",
    tags: ["probability", "distributions"],
    description: "P(X=k) for Binomial(n, p). Return probability rounded to 4 decimal places.",
    examples: [
      { input: "n=10, p=0.5, k=5", output: "0.2461" },
    ],
    constraints: ["0 ≤ k ≤ n ≤ 50"],
    starterCode: `function binomProb(n, p, k) {
  return 0;
}`,
    functionName: "binomProb",
    testCases: [
      { input: { n: 10, p: 0.5, k: 5 }, expected: 0.2461 },
      { input: { n: 20, p: 0.3, k: 6 }, expected: 0.1916 },
      { input: { n: 5, p: 0.5, k: 0 }, expected: 0.0313 },
    ],
    xp: 25,
    acceptance: 34.2,
    totalSolved: 3218,
  },
  {
    id: "sta-009",
    slug: "correlation",
    title: "Pearson Correlation",
    difficulty: "hard",
    topic: "statistics",
    tags: ["correlation", "regression"],
    description: "Compute the Pearson correlation coefficient between two arrays x and y. Return value to 4 decimal places.",
    examples: [
      { input: "x=[1,2,3,4,5], y=[2,4,6,8,10]", output: "1.0000" },
    ],
    constraints: ["equal length arrays, length ≥ 2"],
    starterCode: `function correlation(x, y) {
  return 0;
}`,
    functionName: "correlation",
    testCases: [
      { input: { x: [1, 2, 3, 4, 5], y: [2, 4, 6, 8, 10] }, expected: 1 },
      { input: { x: [1, 2, 3, 4, 5], y: [5, 4, 3, 2, 1] }, expected: -1 },
      { input: { x: [1, 2, 3, 4, 5], y: [1, 2, 3, 5, 8] }, expected: 0.9675 },
    ],
    xp: 30,
    acceptance: 22.1,
    totalSolved: 1847,
  },
  {
    id: "sta-010",
    slug: "z-score",
    title: "Z-Score",
    difficulty: "medium",
    topic: "statistics",
    tags: ["normal-distribution"],
    description: "Compute the z-score: (x - μ) / σ. Return value to 3 decimal places.",
    examples: [
      { input: "x=85, μ=70, σ=10", output: "1.500" },
    ],
    constraints: ["σ > 0"],
    starterCode: `function zScore(x, mu, sigma) {
  return 0;
}`,
    functionName: "zScore",
    testCases: [
      { input: { x: 85, mu: 70, sigma: 10 }, expected: 1.5 },
      { input: { x: 100, mu: 100, sigma: 15 }, expected: 0 },
      { input: { x: 50, mu: 60, sigma: 5 }, expected: -2 },
    ],
    xp: 15,
    acceptance: 68.1,
    totalSolved: 9234,
  },
  {
    id: "sta-011",
    slug: "linear-regression",
    title: "Linear Regression Slope",
    difficulty: "hard",
    topic: "statistics",
    tags: ["regression"],
    description: "Given x and y arrays, compute the slope of the least-squares regression line. Return value to 4 decimal places.",
    examples: [
      { input: "x=[1,2,3,4,5], y=[2,4,5,4,5]", output: "0.6000" },
    ],
    constraints: ["equal length arrays, length ≥ 2"],
    starterCode: `function regressionSlope(x, y) {
  return 0;
}`,
    functionName: "regressionSlope",
    testCases: [
      { input: { x: [1, 2, 3, 4, 5], y: [2, 4, 5, 4, 5] }, expected: 0.6 },
      { input: { x: [1, 2, 3], y: [2, 4, 6] }, expected: 2 },
      { input: { x: [1, 2, 3, 4, 5], y: [5, 5, 5, 5, 5] }, expected: 0 },
    ],
    xp: 25,
    acceptance: 38.7,
    totalSolved: 2891,
  },

  // === MORE CALCULUS ===
  {
    id: "cal-003",
    slug: "limit",
    title: "Numerical Limit",
    difficulty: "medium",
    topic: "calculus",
    tags: ["limits"],
    description: "Compute the limit of f(x) as x approaches a, numerically (use small h = 0.0001).",
    examples: [
      { input: "f(x)=sin(x)/x, a=0", output: "1.0000" },
    ],
    constraints: ["use central difference"],
    starterCode: `function numericalLimit(f, a) {
  // f is a function: f(x) => number
  return 0;
}`,
    functionName: "numericalLimit",
    testCases: [
      { input: { a: 0 }, expected: 1 },
    ],
    xp: 15,
    acceptance: 45.2,
    totalSolved: 4892,
  },
  {
    id: "cal-004",
    slug: "product-rule",
    title: "Product Rule Derivative",
    difficulty: "medium",
    topic: "calculus",
    tags: ["derivatives", "product-rule"],
    description: "Given f(x) = x^n * e^x, return the derivative coefficient for the x^n term (where n is the power).",
    examples: [
      { input: "n=2", output: "x*(x+2)", explanation: "d/dx[x²·e^x] = (2x·e^x + x²·e^x) = x(x+2)·e^x" },
    ],
    constraints: ["n is a non-negative integer"],
    starterCode: `function productDeriv(n, x) {
  // d/dx[x^n * e^x] = e^x * (n*x^(n-1) + x^n)
  // return the coefficient of e^x: n*x^(n-1) + x^n evaluated at x
  return 0;
}`,
    functionName: "productDeriv",
    testCases: [
      { input: { n: 2, x: 3 }, expected: 15 },
      { input: { n: 3, x: 2 }, expected: 20 },
      { input: { n: 1, x: 5 }, expected: 10 },
    ],
    xp: 20,
    acceptance: 38.9,
    totalSolved: 3521,
  },
  {
    id: "cal-005",
    slug: "second-derivative",
    title: "Second Derivative",
    difficulty: "medium",
    topic: "calculus",
    tags: ["derivatives"],
    description: "Compute the second derivative of x^n. Return the coefficient.",
    examples: [
      { input: "n=4, x=2", output: "12" },
    ],
    constraints: ["n ≥ 2"],
    starterCode: `function secondDeriv(n, x) {
  // d²/dx²[x^n] = n*(n-1)*x^(n-2)
  return 0;
}`,
    functionName: "secondDeriv",
    testCases: [
      { input: { n: 4, x: 2 }, expected: 12 },
      { input: { n: 3, x: 5 }, expected: 6 },
      { input: { n: 5, x: 1 }, expected: 20 },
    ],
    xp: 15,
    acceptance: 56.4,
    totalSolved: 6234,
  },
  {
    id: "cal-006",
    slug: "integral-polynomial",
    title: "Integral of Polynomial",
    difficulty: "medium",
    topic: "calculus",
    tags: ["integration"],
    description: "Compute the indefinite integral of x^n. Return {coeff, n} so the result is coeff * x^n.",
    examples: [
      { input: "n=3", output: "{coeff: 0.25, n: 4}", explanation: "∫x³ dx = x⁴/4" },
    ],
    constraints: ["n is a non-negative integer"],
    starterCode: `function integrate(n) {
  // ∫x^n dx = x^(n+1)/(n+1)
  return { coeff: 0, n: 0 };
}`,
    functionName: "integrate",
    testCases: [
      { input: { n: 3 }, expected: { coeff: 0.25, n: 4 } },
      { input: { n: 0 }, expected: { coeff: 1, n: 1 } },
      { input: { n: 2 }, expected: { coeff: 0.3333, n: 3 } },
    ],
    xp: 15,
    acceptance: 52.3,
    totalSolved: 5892,
  },

  // === TRIGONOMETRY ===
  {
    id: "trig-001",
    slug: "sin-degrees",
    title: "Sine in Degrees",
    difficulty: "easy",
    topic: "trigonometry",
    tags: ["trig", "sine"],
    description: "Compute sin(θ) where θ is in degrees. Return value to 3 decimal places.",
    examples: [
      { input: "θ=30", output: "0.500" },
      { input: "θ=90", output: "1.000" },
    ],
    constraints: ["0 ≤ θ ≤ 360"],
    starterCode: `function sind(theta) {
  return 0;
}`,
    functionName: "sind",
    testCases: [
      { input: { theta: 30 }, expected: 0.5 },
      { input: { theta: 90 }, expected: 1 },
      { input: { theta: 180 }, expected: 0 },
      { input: { theta: 270 }, expected: -1 },
    ],
    xp: 10,
    acceptance: 84.2,
    totalSolved: 15234,
  },
  {
    id: "trig-002",
    slug: "cos-degrees",
    title: "Cosine in Degrees",
    difficulty: "easy",
    topic: "trigonometry",
    tags: ["trig", "cosine"],
    description: "Compute cos(θ) where θ is in degrees. Return value to 3 decimal places.",
    examples: [
      { input: "θ=60", output: "0.500" },
      { input: "θ=180", output: "-1.000" },
    ],
    constraints: ["0 ≤ θ ≤ 360"],
    starterCode: `function cosd(theta) {
  return 0;
}`,
    functionName: "cosd",
    testCases: [
      { input: { theta: 60 }, expected: 0.5 },
      { input: { theta: 180 }, expected: -1 },
      { input: { theta: 0 }, expected: 1 },
      { input: { theta: 270 }, expected: 0 },
    ],
    xp: 10,
    acceptance: 82.7,
    totalSolved: 14821,
  },
  {
    id: "trig-003",
    slug: "tangent",
    title: "Tangent in Degrees",
    difficulty: "medium",
    topic: "trigonometry",
    tags: ["trig", "tangent"],
    description: "Compute tan(θ) where θ is in degrees. Return value to 3 decimal places. Handle the case where tan is undefined (return Infinity via 99999 or handle gracefully).",
    examples: [
      { input: "θ=45", output: "1.000" },
      { input: "θ=0", output: "0.000" },
    ],
    constraints: ["0 ≤ θ < 90 or 90 < θ ≤ 180"],
    starterCode: `function tand(theta) {
  return 0;
}`,
    functionName: "tand",
    testCases: [
      { input: { theta: 45 }, expected: 1 },
      { input: { theta: 0 }, expected: 0 },
      { input: { theta: 30 }, expected: 0.577 },
    ],
    xp: 15,
    acceptance: 62.1,
    totalSolved: 8921,
  },
  {
    id: "trig-004",
    slug: "pythagorean-identity",
    title: "Pythagorean Identity Verify",
    difficulty: "easy",
    topic: "trigonometry",
    tags: ["trig", "identities"],
    description: "Verify that sin²(θ) + cos²(θ) ≈ 1. Return true if the sum is within 0.001 of 1.",
    examples: [
      { input: "θ=37", output: "true" },
    ],
    constraints: ["0 ≤ θ ≤ 360"],
    starterCode: `function pythagoreanIdentity(theta) {
  return false;
}`,
    functionName: "pythagoreanIdentity",
    testCases: [
      { input: { theta: 37 }, expected: true },
      { input: { theta: 0 }, expected: true },
      { input: { theta: 90 }, expected: true },
      { input: { theta: 123.456 }, expected: true },
    ],
    xp: 10,
    acceptance: 91.3,
    totalSolved: 18234,
  },
  {
    id: "trig-005",
    slug: "law-of-sines",
    title: "Law of Sines",
    difficulty: "hard",
    topic: "trigonometry",
    tags: ["trig", "triangles"],
    description: "Given side a and angle A, find side c given angle C. Use law of sines: a/sin(A) = c/sin(C). Return c rounded to 2 decimal places.",
    examples: [
      { input: "a=7, A=45, C=60", output: "8.64" },
    ],
    constraints: ["angles in degrees, A, C in (0, 180)"],
    starterCode: `function lawOfSines(a, A, C) {
  // a/sin(A) = c/sin(C)
  return 0;
}`,
    functionName: "lawOfSines",
    testCases: [
      { input: { a: 7, A: 45, C: 60 }, expected: 8.64 },
      { input: { a: 5, A: 30, C: 90 }, expected: 10 },
      { input: { a: 3, A: 60, C: 45 }, expected: 2.45 },
    ],
    xp: 25,
    acceptance: 36.2,
    totalSolved: 3218,
  },
  {
    id: "trig-006",
    slug: "arc-length",
    title: "Arc Length",
    difficulty: "medium",
    topic: "trigonometry",
    tags: ["circles", "arcs"],
    description: "Compute the arc length of a circle: s = r * θ, where θ is in radians.",
    examples: [
      { input: "r=5, θ=π/2", output: "7.85" },
    ],
    constraints: ["r > 0"],
    starterCode: `function arcLength(r, theta) {
  return 0;
}`,
    functionName: "arcLength",
    testCases: [
      { input: { r: 5, theta: Math.PI / 2 }, expected: 7.85 },
      { input: { r: 1, theta: 2 * Math.PI }, expected: 6.28 },
      { input: { r: 10, theta: 1 }, expected: 10 },
    ],
    xp: 15,
    acceptance: 78.4,
    totalSolved: 10234,
  },
  {
    id: "trig-007",
    slug: "inverse-sin",
    title: "Inverse Sine (degrees)",
    difficulty: "medium",
    topic: "trigonometry",
    tags: ["trig", "inverse"],
    description: "Compute arcsin(x) in degrees. Return value to 2 decimal places.",
    examples: [
      { input: "x=0.5", output: "30.00" },
      { input: "x=1", output: "90.00" },
    ],
    constraints: ["-1 ≤ x ≤ 1"],
    starterCode: `function asind(x) {
  return 0;
}`,
    functionName: "asind",
    testCases: [
      { input: { x: 0.5 }, expected: 30 },
      { input: { x: 1 }, expected: 90 },
      { input: { x: 0 }, expected: 0 },
    ],
    xp: 15,
    acceptance: 58.1,
    totalSolved: 6234,
  },

  // === PROBABILITY ===
  {
    id: "prob-001",
    slug: "coin-flip",
    title: "Coin Flip Probability",
    difficulty: "easy",
    topic: "probability",
    tags: ["probability", "binomial"],
    description: "Probability of getting exactly k heads in n fair coin flips. Return value to 4 decimal places.",
    examples: [
      { input: "n=3, k=2", output: "0.3750", explanation: "C(3,2)/2³ = 3/8" },
    ],
    constraints: ["0 ≤ k ≤ n ≤ 20"],
    starterCode: `function coinFlips(n, k) {
  return 0;
}`,
    functionName: "coinFlips",
    testCases: [
      { input: { n: 3, k: 2 }, expected: 0.375 },
      { input: { n: 10, k: 5 }, expected: 0.2461 },
      { input: { n: 4, k: 0 }, expected: 0.0625 },
    ],
    xp: 15,
    acceptance: 64.2,
    totalSolved: 8921,
  },
  {
    id: "prob-002",
    slug: "expected-value-dice",
    title: "Expected Value of Dice",
    difficulty: "easy",
    topic: "probability",
    tags: ["expected-value"],
    description: "Expected value when rolling a fair n-sided die. Return n+1 divided by 2.",
    examples: [
      { input: "n=6", output: "3.5" },
    ],
    constraints: ["n ≥ 2"],
    starterCode: `function diceExpected(n) {
  return 0;
}`,
    functionName: "diceExpected",
    testCases: [
      { input: { n: 6 }, expected: 3.5 },
      { input: { n: 4 }, expected: 2.5 },
      { input: { n: 20 }, expected: 10.5 },
    ],
    xp: 10,
    acceptance: 92.1,
    totalSolved: 20134,
  },
  {
    id: "prob-003",
    slug: "conditional-probability",
    title: "Bayes' Theorem",
    difficulty: "hard",
    topic: "probability",
    tags: ["bayes", "conditional"],
    description: "Given P(A), P(B|A), P(B|¬A), compute P(A|B). Return value to 4 decimal places.",
    examples: [
      { input: "P(A)=0.3, P(B|A)=0.8, P(B|notA)=0.2", output: "0.6316", explanation: "(0.3*0.8)/(0.3*0.8 + 0.7*0.2) = 0.24/0.38" },
    ],
    constraints: ["0 < P(A) < 1"],
    starterCode: `function bayes(pA, pBA, pBnotA) {
  return 0;
}`,
    functionName: "bayes",
    testCases: [
      { input: { pA: 0.3, pBA: 0.8, pBnotA: 0.2 }, expected: 0.6316 },
      { input: { pA: 0.01, pBA: 0.99, pBnotA: 0.05 }, expected: 0.1667 },
      { input: { pA: 0.5, pBA: 0.5, pBnotA: 0.5 }, expected: 0.5 },
    ],
    xp: 30,
    acceptance: 28.1,
    totalSolved: 2341,
  },
  {
    id: "prob-004",
    slug: "geometric-distribution",
    title: "Geometric Distribution",
    difficulty: "hard",
    topic: "probability",
    tags: ["distributions"],
    description: "Probability that the first success occurs on trial k for independent trials with success probability p. Return value to 4 decimal places.",
    examples: [
      { input: "p=0.3, k=3", output: "0.1470", explanation: "(1-0.3)²·0.3 = 0.49·0.3" },
    ],
    constraints: ["0 < p ≤ 1, k ≥ 1"],
    starterCode: `function geometricPMF(p, k) {
  return 0;
}`,
    functionName: "geometricPMF",
    testCases: [
      { input: { p: 0.3, k: 3 }, expected: 0.147 },
      { input: { p: 0.5, k: 1 }, expected: 0.5 },
      { input: { p: 0.1, k: 5 }, expected: 0.0656 },
    ],
    xp: 20,
    acceptance: 41.2,
    totalSolved: 3891,
  },
  {
    id: "prob-005",
    slug: "expected-cards",
    title: "Expected Cards (Poker)",
    difficulty: "hard",
    topic: "probability",
    tags: ["expected-value", "cards"],
    description: "From a standard 52-card deck, how many hearts do you expect to see in a 5-card hand? Return value to 3 decimal places.",
    examples: [
      { input: "5 cards", output: "0.962" },
    ],
    constraints: ["hand size ≤ 52"],
    starterCode: `function expectedHearts(handSize) {
  return 0;
}`,
    functionName: "expectedHearts",
    testCases: [
      { input: { handSize: 5 }, expected: 0.962 },
      { input: { handSize: 13 }, expected: 2.5 },
      { input: { handSize: 26 }, expected: 5 },
    ],
    xp: 25,
    acceptance: 35.4,
    totalSolved: 2891,
  },

  // === LOGIC & WORD PROBLEMS ===
  {
    id: "logic-001",
    slug: "sum-of-digits-n",
    title: "Digital Root",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["digits", "recursion"],
    description: "Compute the digital root of n (repeatedly sum digits until single digit).",
    examples: [
      { input: "n=942", output: "6", explanation: "9+4+2=15, 1+5=6" },
    ],
    constraints: ["0 ≤ n ≤ 10^9"],
    starterCode: `function digitalRoot(n) {
  return 0;
}`,
    functionName: "digitalRoot",
    testCases: [
      { input: { n: 942 }, expected: 6 },
      { input: { n: 999 }, expected: 9 },
      { input: { n: 0 }, expected: 0 },
      { input: { n: 10 }, expected: 1 },
    ],
    xp: 10,
    acceptance: 79.4,
    totalSolved: 11234,
  },
  {
    id: "logic-002",
    slug: "collatz-steps",
    title: "Collatz Conjecture Steps",
    difficulty: "medium",
    topic: "arithmetic",
    tags: ["sequences", "collatz"],
    description: "Count the number of steps to reach 1 starting from n, using: if n even, n = n/2, else n = 3n+1.",
    examples: [
      { input: "n=6", output: "8", explanation: "6→3→10→5→16→8→4→2→1" },
    ],
    constraints: ["1 ≤ n ≤ 10^4"],
    starterCode: `function collatzSteps(n) {
  return 0;
}`,
    functionName: "collatzSteps",
    testCases: [
      { input: { n: 6 }, expected: 8 },
      { input: { n: 1 }, expected: 0 },
      { input: { n: 27 }, expected: 111 },
    ],
    xp: 15,
    acceptance: 54.2,
    totalSolved: 6234,
  },
  {
    id: "logic-003",
    slug: "fibonacci-nth",
    title: "Fibonacci Number",
    difficulty: "easy",
    topic: "arithmetic",
    tags: ["sequences"],
    description: "Return the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
    examples: [
      { input: "n=10", output: "55" },
    ],
    constraints: ["0 ≤ n ≤ 50"],
    starterCode: `function fib(n) {
  return 0;
}`,
    functionName: "fib",
    testCases: [
      { input: { n: 0 }, expected: 0 },
      { input: { n: 1 }, expected: 1 },
      { input: { n: 10 }, expected: 55 },
      { input: { n: 30 }, expected: 832040 },
    ],
    xp: 10,
    acceptance: 73.1,
    totalSolved: 18923,
  },
  {
    id: "logic-004",
    slug: "is-prime-efficient",
    title: "Efficient Prime Check",
    difficulty: "medium",
    topic: "arithmetic",
    tags: ["primes", "optimization"],
    description: "Check if n is prime. Optimize to O(√n) using trial division.",
    examples: [
      { input: "n=97", output: "true" },
    ],
    constraints: ["1 ≤ n ≤ 10^6"],
    starterCode: `function isPrimeEfficient(n) {
  return false;
}`,
    functionName: "isPrimeEfficient",
    testCases: [
      { input: { n: 97 }, expected: true },
      { input: { n: 1000003 }, expected: true },
      { input: { n: 1000000 }, expected: false },
    ],
    xp: 15,
    acceptance: 48.7,
    totalSolved: 5921,
  },
  {
    id: "logic-005",
    slug: "matrix-determinant-2x2",
    title: "2x2 Matrix Determinant",
    difficulty: "easy",
    topic: "algebra",
    tags: ["matrices"],
    description: "Compute the determinant of a 2x2 matrix [[a, b], [c, d]]: ad - bc.",
    examples: [
      { input: "a=1, b=2, c=3, d=4", output: "-2" },
    ],
    constraints: ["any integers"],
    starterCode: `function det2x2(a, b, c, d) {
  return 0;
}`,
    functionName: "det2x2",
    testCases: [
      { input: { a: 1, b: 2, c: 3, d: 4 }, expected: -2 },
      { input: { a: 2, b: 3, c: 4, d: 5 }, expected: -2 },
      { input: { a: 1, b: 0, c: 0, d: 1 }, expected: 1 },
    ],
    xp: 10,
    acceptance: 91.4,
    totalSolved: 21341,
  },
  {
    id: "logic-006",
    slug: "matrix-multiply-2x2",
    title: "2x2 Matrix Multiplication",
    difficulty: "medium",
    topic: "algebra",
    tags: ["matrices"],
    description: "Multiply two 2x2 matrices: A*B where A=[[a,b],[c,d]], B=[[e,f],[g,h]]. Return [[ae+bg, af+bh],[ce+dg, cf+dh]].",
    examples: [
      { input: "A=I, B=any", output: "B" },
    ],
    constraints: ["integers"],
    starterCode: `function matMul2x2(a, b, c, d, e, f, g, h) {
  return [0, 0, 0, 0];
}`,
    functionName: "matMul2x2",
    testCases: [
      { input: { a: 1, b: 0, c: 0, d: 1, e: 5, f: 6, g: 7, h: 8 }, expected: [5, 6, 7, 8] },
      { input: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 }, expected: [19, 22, 43, 50] },
    ],
    xp: 15,
    acceptance: 62.4,
    totalSolved: 8921,
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
