export type LessonBlock =
  | { type: "text"; content: string }
  | { type: "heading"; content: string }
  | { type: "code"; language: string; content: string }
  | { type: "math"; content: string }
  | { type: "callout"; variant: "tip" | "warning" | "note"; content: string }
  | { type: "example"; problem: string; solution: string };

export type Course = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  icon: string;
  color: string;
  totalXp: number;
  units: CourseUnit[];
};

export type CourseUnit = {
  id: string;
  title: string;
  lessons: CourseLesson[];
};

export type CourseLesson = {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  xp: number;
  blocks: LessonBlock[];
  practiceProblemSlugs?: string[];
};

export const courses: Course[] = [
  {
    id: "alg-1",
    slug: "algebra-1",
    title: "Algebra I",
    subject: "Algebra",
    grade: "8–9",
    description: "Variables, equations, functions, and the language math is written in.",
    icon: "ƒ(x)",
    color: "#c4f000",
    totalXp: 350,
    units: [
      {
        id: "u1",
        title: "Variables & Expressions",
        lessons: [
          {
            id: "l1",
            title: "What is a variable?",
            description: "The concept that changed math forever.",
            duration: 8,
            xp: 20,
            blocks: [
              { type: "heading", content: "The idea" },
              { type: "text", content: "Before variables, every problem was a specific number puzzle. Variables let you write rules that work for any number — that's what made algebra algebraic." },
              { type: "callout", variant: "tip", content: "A variable is just a box with a name on it. The name doesn't change the number inside." },
              { type: "math", content: "x + 5 = 12  →  x = 7" },
              { type: "text", content: "Here, x is a placeholder for an unknown number. The rule 'x plus 5 equals 12' lets us solve for x." },
              { type: "example", problem: "If y + 3 = 10, what is y?", solution: "y = 7" },
            ],
            practiceProblemSlugs: ["alg-001"],
          },
          {
            id: "l2",
            title: "Combining like terms",
            description: "Group the similar, simplify the mess.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "heading", content: "Like terms" },
              { type: "text", content: "Like terms are terms that have the same variable raised to the same power. You can add or subtract them, but not mix them with different variables." },
              { type: "math", content: "3x + 2x = 5x  ✓  (same variable)\n3x + 2y = 3x + 2y  ✗  (different variables)" },
              { type: "heading", content: "Distribution" },
              { type: "text", content: "Multiply every term inside parentheses by the term outside." },
              { type: "math", content: "2(x + 3) = 2x + 6" },
              { type: "example", problem: "Simplify: 2(x + 4) + 3x", solution: "2x + 8 + 3x = 5x + 8" },
            ],
            practiceProblemSlugs: ["alg-001"],
          },
        ],
      },
      {
        id: "u2",
        title: "Linear Equations",
        lessons: [
          {
            id: "l3",
            title: "Solving for x",
            description: "Get x alone. That's the whole game.",
            duration: 12,
            xp: 30,
            blocks: [
              { type: "heading", content: "The goal" },
              { type: "text", content: "Every linear equation is a balance. To keep the balance, do the same thing to both sides. The goal: get x alone on one side." },
              { type: "code", language: "math", content: "2x + 5 = 13\n  2x = 8     (subtract 5 from both sides)\n   x = 4     (divide both sides by 2)" },
              { type: "callout", variant: "warning", content: "Whatever you do to one side, you must do to the other. Always." },
              { type: "example", problem: "Solve: 3x - 7 = 11", solution: "3x = 18 → x = 6" },
            ],
            practiceProblemSlugs: ["alg-001", "alg-003"],
          },
          {
            id: "l4",
            title: "Word problems → equations",
            description: "Translate English into math, then solve.",
            duration: 15,
            xp: 35,
            blocks: [
              { type: "text", content: "Most students get stuck on word problems not because of the math, but because of the translation. Read the problem once for meaning, then again for numbers and operations." },
              { type: "heading", content: "Translation patterns" },
              { type: "text", content: "\"is\" or \"was\" → =\n\"of\" → ×\n\"more than\" / \"less than\" → + / −\n\"per\" / \"each\" → division" },
              { type: "example", problem: "A pizza costs $12 plus $2 per topping. If you have $20, how many toppings can you get?", solution: "12 + 2t = 20 → 2t = 8 → t = 4" },
            ],
            practiceProblemSlugs: ["alg-001"],
          },
        ],
      },
      {
        id: "u3",
        title: "Quadratics",
        lessons: [
          {
            id: "l5",
            title: "Factoring quadratics",
            description: "FOIL backwards.",
            duration: 14,
            xp: 30,
            blocks: [
              { type: "text", content: "A quadratic is ax² + bx + c. To factor, find two numbers that multiply to ac and add to b." },
              { type: "code", language: "math", content: "x² + 5x + 6\n  multiply to 6, add to 5: 2 and 3\n  x² + 2x + 3x + 6\n  x(x + 2) + 3(x + 2)\n  (x + 2)(x + 3)" },
              { type: "example", problem: "Factor: x² + 7x + 12", solution: "(x + 3)(x + 4)" },
            ],
            practiceProblemSlugs: ["alg-003"],
          },
          {
            id: "l6",
            title: "The quadratic formula",
            description: "When factoring doesn't work, this does.",
            duration: 16,
            xp: 35,
            blocks: [
              { type: "heading", content: "The formula" },
              { type: "math", content: "x = (-b ± √(b² - 4ac)) / 2a" },
              { type: "text", content: "Plug in a, b, c from ax² + bx + c = 0. The expression under the square root (b² - 4ac) is the discriminant. If it's negative, no real roots." },
              { type: "callout", variant: "tip", content: "The quadratic formula always works. Use it when factoring is hard or impossible." },
              { type: "example", problem: "Solve: 2x² - 5x - 3 = 0", solution: "a=2, b=-5, c=-3 → x = (5 ± 7) / 4 → x = 3 or x = -0.5" },
            ],
            practiceProblemSlugs: ["alg-003", "alg-002"],
          },
        ],
      },
    ],
  },
  {
    id: "geo-1",
    slug: "geometry",
    title: "Geometry",
    subject: "Geometry",
    grade: "7–10",
    description: "Shapes, proofs, and the spatial reasoning behind everything from architecture to AI.",
    icon: "△",
    color: "#60a5fa",
    totalXp: 300,
    units: [
      {
        id: "u1",
        title: "Foundations",
        lessons: [
          {
            id: "l1",
            title: "Points, lines, planes",
            description: "The three undefined terms everything else is built from.",
            duration: 8,
            xp: 20,
            blocks: [
              { type: "text", content: "Geometry starts with three concepts we accept without definition: a point (a location), a line (an infinite path of points), and a plane (a flat surface extending infinitely)." },
              { type: "callout", variant: "note", content: "Everything else in geometry — angles, triangles, circles — is built from these three." },
            ],
          },
          {
            id: "l2",
            title: "Angles",
            description: "Measuring the space between two lines.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "text", content: "An angle measures rotation. Full rotation = 360°. Half = 180°. Quarter = 90° (right angle)." },
              { type: "heading", content: "Key angle pairs" },
              { type: "text", content: "Complementary angles add to 90°. Supplementary add to 180°. Vertical angles (opposite when two lines cross) are equal." },
              { type: "example", problem: "If two angles are supplementary and one is 65°, what is the other?", solution: "180° - 65° = 115°" },
            ],
            practiceProblemSlugs: ["geo-002"],
          },
        ],
      },
      {
        id: "u2",
        title: "Triangles",
        lessons: [
          {
            id: "l3",
            title: "Triangle fundamentals",
            description: "Three sides, three angles, infinite variety.",
            duration: 12,
            xp: 30,
            blocks: [
              { type: "heading", content: "Angle sum" },
              { type: "math", content: "The three angles of any triangle sum to 180°." },
              { type: "heading", content: "Pythagorean theorem" },
              { type: "math", content: "a² + b² = c²  (where c is the hypotenuse — the longest side, opposite the right angle)" },
              { type: "callout", variant: "tip", content: "Pythagorean triples (3-4-5, 5-12-13, 8-15-17) are worth memorizing — they appear constantly." },
              { type: "example", problem: "A right triangle has legs of length 6 and 8. What is the hypotenuse?", solution: "6² + 8² = 36 + 64 = 100 → √100 = 10" },
            ],
            practiceProblemSlugs: ["geo-002", "geo-003"],
          },
          {
            id: "l4",
            title: "Similar triangles",
            description: "Same shape, different size. Sides scale, angles don't.",
            duration: 14,
            xp: 35,
            blocks: [
              { type: "text", content: "Two triangles are similar if their angles match. Corresponding sides are then in the same ratio." },
              { type: "code", language: "math", content: "Triangle A has sides 3, 4, 5.\nSimilar triangle B has corresponding side 6.\nScale factor: 6/3 = 2\nOther sides: 4×2=8, 5×2=10\nTriangle B: 6, 8, 10" },
            ],
            practiceProblemSlugs: ["geo-002"],
          },
        ],
      },
    ],
  },
  {
    id: "ari-1",
    slug: "arithmetic",
    title: "Arithmetic & Number Theory",
    subject: "Arithmetic",
    grade: "5–7",
    description: "The foundation everything else stands on. Master these, and the rest gets easier.",
    icon: "∑",
    color: "#fbbf24",
    totalXp: 250,
    units: [
      {
        id: "u1",
        title: "Primes & Divisibility",
        lessons: [
          {
            id: "l1",
            title: "What is a prime?",
            description: "The atoms of number theory.",
            duration: 7,
            xp: 20,
            blocks: [
              { type: "text", content: "A prime number is divisible only by 1 and itself. The first few: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29..." },
              { type: "callout", variant: "note", content: "Every number greater than 1 can be written as a product of primes. This is the Fundamental Theorem of Arithmetic." },
              { type: "example", problem: "Is 17 prime?", solution: "Yes. Its only divisors are 1 and 17." },
            ],
            practiceProblemSlugs: ["ari-004"],
          },
          {
            id: "l2",
            title: "GCD & LCM",
            description: "The two most useful operations on whole numbers.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "heading", content: "GCD (Greatest Common Divisor)" },
              { type: "text", content: "The largest number that divides both. The Euclidean algorithm is the fastest way: gcd(a, b) = gcd(b, a mod b)." },
              { type: "heading", content: "LCM (Least Common Multiple)" },
              { type: "text", content: "The smallest number divisible by both. lcm(a, b) = (a × b) / gcd(a, b)." },
              { type: "example", problem: "Find gcd(12, 18) and lcm(12, 18).", solution: "gcd = 6. lcm = 36." },
            ],
            practiceProblemSlugs: ["ari-003"],
          },
        ],
      },
      {
        id: "u2",
        title: "Sequences & Series",
        lessons: [
          {
            id: "l3",
            title: "Arithmetic sequences",
            description: "Same step, every time.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "text", content: "An arithmetic sequence has a constant difference between terms. Formula: a_n = a_1 + (n-1)d" },
              { type: "example", problem: "Find the 10th term: 3, 7, 11, 15, ...", solution: "a₁=3, d=4, n=10 → 3 + 9·4 = 39" },
            ],
          },
          {
            id: "l4",
            title: "Geometric sequences",
            description: "Same ratio, every time.",
            duration: 12,
            xp: 30,
            blocks: [
              { type: "text", content: "Each term is the previous times a constant ratio. Formula: a_n = a_1 × r^(n-1)" },
              { type: "callout", variant: "warning", content: "If |r| < 1, the sum converges. If |r| ≥ 1, it diverges. The infinite sum 1 + 1/2 + 1/4 + ... = 2." },
              { type: "example", problem: "Find the 6th term: 2, 6, 18, 54, ...", solution: "a₁=2, r=3 → 2 × 3⁵ = 486" },
            ],
            practiceProblemSlugs: ["ari-002"],
          },
        ],
      },
    ],
  },
  {
    id: "sta-1",
    slug: "statistics",
    title: "Statistics & Probability",
    subject: "Statistics",
    grade: "9–12",
    description: "How to read data without lying to yourself.",
    icon: "σ",
    color: "#a78bfa",
    totalXp: 300,
    units: [
      {
        id: "u1",
        title: "Descriptive Statistics",
        lessons: [
          {
            id: "l1",
            title: "Mean, median, mode",
            description: "Three ways to summarize a list of numbers.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "text", content: "Mean: the average (sum ÷ count). Median: the middle value when sorted. Mode: the most common value." },
              { type: "callout", variant: "tip", content: "The median is robust to outliers. The mean isn't. If one value is 1000x the others, use median." },
              { type: "example", problem: "Find mean, median, mode: [2, 3, 4, 4, 5, 6]", solution: "Mean = 4, Median = 4, Mode = 4" },
            ],
            practiceProblemSlugs: ["sta-001", "sta-002"],
          },
          {
            id: "l2",
            title: "Standard deviation",
            description: "How spread out the numbers are.",
            duration: 14,
            xp: 35,
            blocks: [
              { type: "text", content: "Standard deviation measures spread. Low = numbers cluster around the mean. High = they're all over." },
              { type: "code", language: "math", content: "1. Find the mean (μ).\n2. Subtract the mean from each value, square the result.\n3. Average those squares — that's the variance (σ²).\n4. Take the square root — that's the std dev (σ)." },
              { type: "example", problem: "Find σ for [2, 4, 4, 4, 5, 5, 7, 9]", solution: "μ=5, variance=4.57, σ≈2.14" },
            ],
            practiceProblemSlugs: ["sta-003"],
          },
        ],
      },
    ],
  },
  {
    id: "cal-1",
    slug: "calculus",
    title: "Calculus",
    subject: "Calculus",
    grade: "11–12",
    description: "The mathematics of change. Two ideas: derivatives and integrals.",
    icon: "∫",
    color: "#f472b6",
    totalXp: 350,
    units: [
      {
        id: "u1",
        title: "Derivatives",
        lessons: [
          {
            id: "l1",
            title: "The derivative as slope",
            description: "How fast is something changing, right now?",
            duration: 14,
            xp: 35,
            blocks: [
              { type: "text", content: "A derivative is the instantaneous rate of change. Geometrically: the slope of the tangent line at a point." },
              { type: "heading", content: "The power rule" },
              { type: "math", content: "d/dx [xⁿ] = n·x^(n-1)" },
              { type: "text", content: "Multiply by the exponent, drop the exponent by 1. That's it." },
              { type: "example", problem: "Differentiate: 4x³ + 2x - 7", solution: "12x² + 2" },
            ],
            practiceProblemSlugs: ["cal-001", "alg-004"],
          },
        ],
      },
      {
        id: "u2",
        title: "Integration",
        lessons: [
          {
            id: "l2",
            title: "The integral as area",
            description: "Adding up infinitely many infinitely thin slices.",
            duration: 16,
            xp: 40,
            blocks: [
              { type: "text", content: "An integral computes the area under a curve. The Fundamental Theorem of Calculus connects it to derivatives: they're inverse operations." },
              { type: "heading", content: "The power rule for integrals" },
              { type: "math", content: "∫ xⁿ dx = x^(n+1) / (n+1) + C" },
              { type: "callout", variant: "note", content: "Don't forget +C. The constant of integration. It's the one part your derivative erased." },
            ],
            practiceProblemSlugs: ["cal-002"],
          },
        ],
      },
    ],
  },

  // === PRE-ALGEBRA ===
  {
    id: "pre-alg",
    slug: "pre-algebra",
    title: "Pre-Algebra",
    subject: "Pre-Algebra",
    grade: "6–7",
    description: "The bridge between arithmetic and algebra. Fractions, decimals, ratios, and the basics of working with variables.",
    icon: "±",
    color: "#34d399",
    totalXp: 300,
    units: [
      {
        id: "u1",
        title: "Integers & Operations",
        lessons: [
          {
            id: "l1",
            title: "Negative numbers",
            description: "Addition and subtraction with negatives.",
            duration: 10,
            xp: 20,
            blocks: [
              { type: "heading", content: "The number line extends both ways" },
              { type: "text", content: "Every positive number has a negative twin. Together they make the integers. Negative numbers behave like a debt: -3 means you owe 3." },
              { type: "heading", content: "Adding and subtracting" },
              { type: "text", content: "When signs match, add and keep the sign. When signs differ, subtract and keep the sign of the larger absolute value." },
              { type: "math", content: "-5 + 3 = -2\n-5 + 8 = 3\n-5 - 3 = -8" },
              { type: "callout", variant: "tip", content: "Think of negatives as red chips and positives as blue chips. Cancel pairs as you go." },
              { type: "example", problem: "Compute: -12 + 7 - 3 + 9", solution: "1" },
            ],
          },
          {
            id: "l2",
            title: "Multiplying and dividing negatives",
            description: "The sign rules that make everything work.",
            duration: 8,
            xp: 20,
            blocks: [
              { type: "text", content: "Negative × negative = positive. Negative × positive = negative. Count the negative signs: even count → positive, odd count → negative." },
              { type: "math", content: "(-3) × (-4) = 12\n(-3) × 4 = -12\n3 × 4 = 12" },
              { type: "callout", variant: "warning", content: "Division follows the same rules. A negative divided by a positive is negative. A negative divided by a negative is positive." },
              { type: "example", problem: "Compute: (-2) × (-3) × (-4)", solution: "-24" },
            ],
          },
        ],
      },
      {
        id: "u2",
        title: "Fractions & Decimals",
        lessons: [
          {
            id: "l3",
            title: "Operating with fractions",
            description: "Add, subtract, multiply, divide.",
            duration: 14,
            xp: 25,
            blocks: [
              { type: "heading", content: "Same denominator: add numerators" },
              { type: "math", content: "1/4 + 2/4 = 3/4" },
              { type: "heading", content: "Different denominators: find common denominator" },
              { type: "text", content: "Find the LCM. Convert each fraction. Add numerators. Simplify." },
              { type: "math", content: "1/3 + 1/4 = 4/12 + 3/12 = 7/12" },
              { type: "heading", content: "Multiplication: straight across" },
              { type: "math", content: "2/3 × 3/4 = 6/12 = 1/2" },
              { type: "heading", content: "Division: flip the second, then multiply" },
              { type: "math", content: "2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6" },
              { type: "example", problem: "Compute: 3/4 + 1/6", solution: "11/12" },
            ],
          },
          {
            id: "l4",
            title: "Converting between fractions and decimals",
            description: "Two ways to write the same number.",
            duration: 10,
            xp: 20,
            blocks: [
              { type: "text", content: "Fraction to decimal: divide numerator by denominator. 3/4 = 3 ÷ 4 = 0.75." },
              { type: "text", content: "Decimal to fraction: write the digits over the place value. 0.65 = 65/100 = 13/20." },
              { type: "callout", variant: "tip", content: "Terminating decimals convert cleanly. Repeating decimals (1/3 = 0.333...) are best left as fractions." },
              { type: "example", problem: "Convert 0.36 to a fraction in lowest terms", solution: "9/25" },
            ],
            practiceProblemSlugs: ["ari-009"],
          },
        ],
      },
      {
        id: "u3",
        title: "Ratios, Rates & Percentages",
        lessons: [
          {
            id: "l5",
            title: "Ratios and proportions",
            description: "Comparing quantities.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "text", content: "A ratio compares two quantities. 3:4 means for every 3 of the first, there are 4 of the second." },
              { type: "heading", content: "Proportions" },
              { type: "text", content: "When two ratios are equal: a/b = c/d. Cross-multiply to solve: ad = bc." },
              { type: "math", content: "If 3/4 = x/12, then 4x = 36, so x = 9." },
              { type: "callout", variant: "tip", content: "Always check: does the answer make sense? If 3 out of 4 is less than 1, x out of 12 should also be less than 12." },
              { type: "example", problem: "If 5 apples cost $3, how much do 12 apples cost?", solution: "$7.20" },
            ],
            practiceProblemSlugs: ["ari-010"],
          },
          {
            id: "l6",
            title: "Percentages",
            description: "Parts per hundred.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "text", content: "\"Percent\" means \"per hundred\". 25% = 25/100 = 1/4." },
              { type: "heading", content: "Three core operations" },
              { type: "text", content: "Find p% of n: multiply. n is p% of what: divide. p% of what is n: divide again." },
              { type: "math", content: "20% of 150 = 0.20 × 150 = 30\n50 is 25% of 200" },
              { type: "callout", variant: "tip", content: "Converting: 25% = 0.25 = 1/4. Memorize: 50%=1/2, 25%=1/4, 10%=1/10, 33%≈1/3, 20%=1/5." },
              { type: "example", problem: "A $80 item is 15% off. What's the sale price?", solution: "$68" },
            ],
            practiceProblemSlugs: ["ari-009"],
          },
        ],
      },
    ],
  },

  // === ALGEBRA II ===
  {
    id: "alg-2",
    slug: "algebra-2",
    title: "Algebra II",
    subject: "Algebra",
    grade: "10–11",
    description: "Polynomials, rational functions, logarithms, sequences, and complex numbers. The next step past Algebra I.",
    icon: "∑",
    color: "#22d3ee",
    totalXp: 400,
    units: [
      {
        id: "u1",
        title: "Polynomial Operations",
        lessons: [
          {
            id: "l1",
            title: "Polynomial multiplication",
            description: "FOIL and beyond.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "text", content: "Multiply every term in the first polynomial by every term in the second. Combine like terms." },
              { type: "math", content: "(x + 3)(x² - 2x + 5)\n= x³ - 2x² + 5x + 3x² - 6x + 15\n= x³ - x + 15" },
              { type: "callout", variant: "tip", content: "Box method: draw a grid. Label rows with one polynomial, columns with the other. Fill in products. Add along diagonals." },
              { type: "example", problem: "Multiply: (x + 2)(x + 3)", solution: "x² + 5x + 6" },
            ],
          },
          {
            id: "l2",
            title: "Polynomial long division",
            description: "Divide one polynomial by another.",
            duration: 15,
            xp: 30,
            blocks: [
              { type: "text", content: "Like number long division: divide leading terms, multiply, subtract, bring down, repeat." },
              { type: "code", language: "math", content: "(x³ + 2x² - x + 1) ÷ (x - 1)\n  x³ ÷ x = x². Multiply: x²(x-1) = x³ - x². Subtract: 3x² - x + 1\n  3x² ÷ x = 3x. Multiply: 3x(x-1) = 3x² - 3x. Subtract: 2x + 1\n  2x ÷ x = 2. Multiply: 2(x-1) = 2x - 2. Subtract: 3\n  Remainder: 3. So quotient is x² + 3x + 2, remainder 3." },
              { type: "example", problem: "Divide (x² + 5x + 6) by (x + 2)", solution: "x + 3" },
            ],
          },
        ],
      },
      {
        id: "u2",
        title: "Rational Functions",
        lessons: [
          {
            id: "l3",
            title: "Simplifying rational expressions",
            description: "Factor and cancel.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "text", content: "A rational expression is a fraction with polynomials. To simplify, factor numerator and denominator, then cancel common factors." },
              { type: "math", content: "(x² - 4) / (x² - 2x)\n= (x+2)(x-2) / x(x-2)\n= (x+2) / x" },
              { type: "callout", variant: "warning", content: "Never cancel terms, only factors. (x + 2) / x is not 2. (x² + 2x) / x is (x)(x+2)/x = x+2." },
              { type: "example", problem: "Simplify: (x² - 9) / (x² + 3x)", solution: "(x-3)/x" },
            ],
          },
        ],
      },
      {
        id: "u3",
        title: "Logarithms",
        lessons: [
          {
            id: "l4",
            title: "Logarithm fundamentals",
            description: "The inverse of exponentiation.",
            duration: 14,
            xp: 30,
            blocks: [
              { type: "heading", content: "Definition" },
              { type: "text", content: "log_b(x) = y means b^y = x. Read as \"log base b of x equals y\"." },
              { type: "math", content: "log_2(8) = 3  (because 2³ = 8)\nlog_10(1000) = 3  (because 10³ = 1000)\nlog_e(x) is written as ln(x)" },
              { type: "heading", content: "Key rules" },
              { type: "math", content: "log(xy) = log(x) + log(y)\nlog(x/y) = log(x) - log(y)\nlog(xⁿ) = n·log(x)\nlog(1) = 0" },
              { type: "callout", variant: "tip", content: "log without a base usually means log base 10 in applied math, and ln (log base e) in calculus." },
              { type: "example", problem: "Evaluate: log_2(32)", solution: "5" },
            ],
            practiceProblemSlugs: ["alg-008"],
          },
        ],
      },
    ],
  },

  // === TRIGONOMETRY ===
  {
    id: "trig",
    slug: "trigonometry",
    title: "Trigonometry",
    subject: "Trigonometry",
    grade: "10–12",
    description: "The math of triangles and waves. From the unit circle to identities to solving any triangle.",
    icon: "∠",
    color: "#fb923c",
    totalXp: 350,
    units: [
      {
        id: "u1",
        title: "Unit Circle & Identities",
        lessons: [
          {
            id: "l1",
            title: "The unit circle",
            description: "Where every angle has a point.",
            duration: 14,
            xp: 30,
            blocks: [
              { type: "text", content: "The unit circle is a circle of radius 1 centered at the origin. For any angle θ measured from the positive x-axis, the point on the circle is (cos θ, sin θ)." },
              { type: "heading", content: "Common values" },
              { type: "math", content: "(cos 0°, sin 0°) = (1, 0)\n(cos 30°, sin 30°) = (√3/2, 1/2)\n(cos 45°, sin 45°) = (√2/2, √2/2)\n(cos 60°, sin 60°) = (1/2, √3/2)\n(cos 90°, sin 90°) = (0, 1)" },
              { type: "callout", variant: "tip", content: "Memorize these. They appear constantly. The pattern: as angle goes 0°→90°, cos goes 1→0, sin goes 0→1." },
              { type: "example", problem: "Find cos(60°)", solution: "0.5" },
            ],
            practiceProblemSlugs: ["trig-001", "trig-002"],
          },
          {
            id: "l2",
            title: "Pythagorean identity",
            description: "The most important identity in all of math.",
            duration: 10,
            xp: 25,
            blocks: [
              { type: "heading", content: "sin² + cos² = 1" },
              { type: "text", content: "For any angle θ: sin²(θ) + cos²(θ) = 1. This follows directly from the unit circle and the Pythagorean theorem." },
              { type: "heading", content: "Other key identities" },
              { type: "math", content: "tan(θ) = sin(θ) / cos(θ)\nsin(2θ) = 2·sin(θ)·cos(θ)\ncos(2θ) = cos²(θ) - sin²(θ)" },
              { type: "callout", variant: "tip", content: "When stuck, write sin² + cos² = 1. Solve for what you need. This identity saves you constantly." },
              { type: "example", problem: "If sin(θ) = 0.6, find cos(θ) (acute angle)", solution: "0.8" },
            ],
            practiceProblemSlugs: ["trig-004"],
          },
        ],
      },
      {
        id: "u2",
        title: "Law of Sines & Cosines",
        lessons: [
          {
            id: "l3",
            title: "Law of sines",
            description: "When you know an angle and its opposite side.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "heading", content: "The law" },
              { type: "math", content: "a / sin(A) = b / sin(B) = c / sin(C)" },
              { type: "text", content: "Works for any triangle. Use it when you know (or can find) two angles and one side, or two sides and a non-included angle." },
              { type: "callout", variant: "warning", content: "The ambiguous case (SSA) can give 0, 1, or 2 triangles. Check the height: h = b·sin(A). If a < h, no triangle. If a = h, one. If h < a < b, two." },
              { type: "example", problem: "In triangle ABC, A=30°, a=5, B=45°. Find b.", solution: "b ≈ 7.07" },
            ],
            practiceProblemSlugs: ["trig-005"],
          },
          {
            id: "l4",
            title: "Law of cosines",
            description: "When you know two sides and the included angle.",
            duration: 12,
            xp: 25,
            blocks: [
              { type: "heading", content: "The law" },
              { type: "math", content: "c² = a² + b² - 2ab·cos(C)" },
              { type: "text", content: "Works for any triangle. Use it when you know SAS (two sides and the included angle) or SSS (all three sides)." },
              { type: "callout", variant: "tip", content: "When C = 90°, cos(C) = 0, and the law reduces to the Pythagorean theorem. Law of cosines is the generalization." },
              { type: "example", problem: "Sides a=5, b=7, included angle C=60°. Find c.", solution: "c ≈ 6.24" },
            ],
            practiceProblemSlugs: ["geo-007"],
          },
        ],
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getAllCourses(): Course[] {
  return courses;
}
