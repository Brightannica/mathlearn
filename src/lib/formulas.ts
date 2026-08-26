export type Formula = {
  name: string;
  latex: string;
  description: string;
  when: string;
};

export type FormulaSheet = {
  courseSlug: string;
  title: string;
  formulas: Formula[];
};

export const formulaSheets: FormulaSheet[] = [
  {
    courseSlug: "algebra-1",
    title: "Algebra I Formulas",
    formulas: [
      { name: "Quadratic Formula", latex: "x = (-b ± √(b² - 4ac)) / 2a", description: "Roots of ax² + bx + c = 0", when: "When factoring fails" },
      { name: "Slope", latex: "m = (y₂ - y₁) / (x₂ - x₁)", description: "Slope between two points", when: "Linear equations" },
      { name: "Point-Slope Form", latex: "y - y₁ = m(x - x₁)", description: "Line through a point with slope m", when: "Writing line equations" },
      { name: "Slope-Intercept Form", latex: "y = mx + b", description: "Line with slope m, y-intercept b", when: "Graphing lines" },
      { name: "Standard Form", latex: "ax + by = c", description: "Linear equation standard form", when: "Systems of equations" },
      { name: "Vertex Form", latex: "y = a(x - h)² + k", description: "Parabola with vertex (h, k)", when: "Completing the square" },
      { name: "Discriminant", latex: "Δ = b² - 4ac", description: "Number of roots: Δ>0 two, Δ=0 one, Δ<0 none", when: "Analyzing quadratics" },
      { name: "FOIL", latex: "(a+b)(c+d) = ac + ad + bc + bd", description: "Multiply binomials", when: "Factoring/polynomials" },
    ],
  },
  {
    courseSlug: "geometry",
    title: "Geometry Formulas",
    formulas: [
      { name: "Circle Area", latex: "A = πr²", description: "Area of a circle with radius r", when: "Circles" },
      { name: "Circle Circumference", latex: "C = 2πr", description: "Distance around a circle", when: "Circles" },
      { name: "Triangle Area", latex: "A = ½ · b · h", description: "Area from base and height", when: "Triangles" },
      { name: "Heron's Formula", latex: "A = √(s(s-a)(s-b)(s-c))", description: "Area from three sides (s = semi-perimeter)", when: "Triangle sides known" },
      { name: "Pythagorean Theorem", latex: "a² + b² = c²", description: "Right triangle, c is hypotenuse", when: "Right triangles" },
      { name: "Sphere Volume", latex: "V = (4/3)πr³", description: "Volume of a sphere", when: "Spheres" },
      { name: "Sphere Surface", latex: "S = 4πr²", description: "Surface area of a sphere", when: "Spheres" },
      { name: "Cylinder Volume", latex: "V = πr²h", description: "Volume of a cylinder", when: "Cylinders" },
      { name: "Cone Volume", latex: "V = (1/3)πr²h", description: "Volume of a cone", when: "Cones" },
      { name: "Sum of Angles in Polygon", latex: "Σ = (n - 2) · 180°", description: "Sum of interior angles, n sides", when: "Polygons" },
    ],
  },
  {
    courseSlug: "arithmetic",
    title: "Arithmetic Formulas",
    formulas: [
      { name: "Percent of a Number", latex: "p% of n = (p / 100) · n", description: "Find p% of n", when: "Percentages" },
      { name: "Percent Change", latex: "Δ% = (new - old) / old · 100", description: "Percent increase or decrease", when: "Growth, discounts" },
      { name: "Simple Interest", latex: "I = P · r · t", description: "Interest on principal P at rate r for t years", when: "Finance" },
      { name: "Compound Interest", latex: "A = P(1 + r/n)^(nt)", description: "Amount after compound interest", when: "Finance" },
      { name: "Distance", latex: "d = r · t", description: "Distance = rate × time", when: "Word problems" },
      { name: "Sum of Arithmetic Series", latex: "S = n/2 · (a₁ + aₙ)", description: "Sum of n terms", when: "Sequences" },
      { name: "Sum of Geometric Series", latex: "S = a(1 - rⁿ) / (1 - r)", description: "Sum when r ≠ 1", when: "Sequences" },
    ],
  },
  {
    courseSlug: "statistics",
    title: "Statistics Formulas",
    formulas: [
      { name: "Mean", latex: "μ = (Σx) / n", description: "Average value", when: "Central tendency" },
      { name: "Variance (population)", latex: "σ² = Σ(x - μ)² / n", description: "Spread around the mean", when: "Spread" },
      { name: "Standard Deviation", latex: "σ = √(σ²)", description: "Average distance from mean", when: "Spread" },
      { name: "Z-Score", latex: "z = (x - μ) / σ", description: "Standardized value", when: "Normal distribution" },
      { name: "Permutation", latex: "nPr = n! / (n - r)!", description: "Ordered arrangements", when: "Combinations" },
      { name: "Combination", latex: "nCr = n! / (r! · (n - r)!)", description: "Unordered selections", when: "Combinations" },
      { name: "Binomial PMF", latex: "P(k) = C(n,k) · pᵏ · (1-p)ⁿ⁻ᵏ", description: "k successes in n trials", when: "Discrete probability" },
      { name: "Pearson Correlation", latex: "r = Σ((x-x̄)(y-ȳ)) / √(Σ(x-x̄)²·Σ(y-ȳ)²)", description: "Linear correlation strength", when: "Regression" },
    ],
  },
  {
    courseSlug: "calculus",
    title: "Calculus Formulas",
    formulas: [
      { name: "Power Rule (derivative)", latex: "d/dx[xⁿ] = n·xⁿ⁻¹", description: "Derivative of x^n", when: "Polynomials" },
      { name: "Power Rule (integral)", latex: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C", description: "Antiderivative of x^n", when: "Polynomials" },
      { name: "Product Rule", latex: "(fg)' = f'g + fg'", description: "Derivative of a product", when: "Products of functions" },
      { name: "Quotient Rule", latex: "(f/g)' = (f'g - fg') / g²", description: "Derivative of a quotient", when: "Ratios" },
      { name: "Chain Rule", latex: "(f∘g)'(x) = f'(g(x)) · g'(x)", description: "Derivative of composition", when: "Nested functions" },
      { name: "Fundamental Theorem", latex: "∫ₐᵇ f(x)dx = F(b) - F(a)", description: "Where F' = f", when: "Definite integrals" },
      { name: "Trapezoid Rule", latex: "∫ ≈ (h/2)[f(x₀) + 2f(x₁) + ... + f(xₙ)]", description: "Numerical integration", when: "Can't integrate exactly" },
    ],
  },
  {
    courseSlug: "trigonometry",
    title: "Trigonometry Formulas",
    formulas: [
      { name: "Pythagorean Identity", latex: "sin²(θ) + cos²(θ) = 1", description: "The most important identity", when: "Always" },
      { name: "Tangent", latex: "tan(θ) = sin(θ) / cos(θ)", description: "Ratio of sine to cosine", when: "Trig ratios" },
      { name: "Sine Double Angle", latex: "sin(2θ) = 2·sin(θ)·cos(θ)", description: "Double angle identity", when: "Power reduction" },
      { name: "Cosine Double Angle", latex: "cos(2θ) = cos²(θ) - sin²(θ)", description: "Double angle identity", when: "Power reduction" },
      { name: "Law of Sines", latex: "a/sin(A) = b/sin(B) = c/sin(C)", description: "When you know an angle-opposite pair", when: "Non-right triangles" },
      { name: "Law of Cosines", latex: "c² = a² + b² - 2ab·cos(C)", description: "When you know SAS or SSS", when: "Non-right triangles" },
      { name: "Arc Length", latex: "s = r·θ", description: "θ in radians", when: "Circular motion" },
    ],
  },
  {
    courseSlug: "pre-algebra",
    title: "Pre-Algebra Formulas",
    formulas: [
      { name: "Fraction to Decimal", latex: "a/b = a ÷ b", description: "Divide to convert", when: "Converting" },
      { name: "Decimal to Fraction", latex: "0.ab = ab / 100", description: "Digits over place value", when: "Converting" },
      { name: "Percent to Decimal", latex: "p% = p / 100", description: "Move decimal two places left", when: "Converting" },
      { name: "Cross Multiply (proportion)", latex: "a/b = c/d → ad = bc", description: "Solve proportions", when: "Ratios" },
      { name: "Percent of Number", latex: "p% of n = (p · n) / 100", description: "Find part of a whole", when: "Percentages" },
    ],
  },
  {
    courseSlug: "algebra-2",
    title: "Algebra II Formulas",
    formulas: [
      { name: "Log Definition", latex: "log_b(x) = y ⟺ b^y = x", description: "Log is the inverse of exponentiation", when: "Logs" },
      { name: "Log Product Rule", latex: "log(xy) = log(x) + log(y)", description: "Log of product is sum of logs", when: "Simplifying" },
      { name: "Log Quotient Rule", latex: "log(x/y) = log(x) - log(y)", description: "Log of quotient is difference", when: "Simplifying" },
      { name: "Log Power Rule", latex: "log(xⁿ) = n·log(x)", description: "Pull exponent out front", when: "Solving exponentials" },
      { name: "Change of Base", latex: "log_b(x) = ln(x) / ln(b)", description: "Convert any log to natural log", when: "Computing logs" },
      { name: "Sum of Geometric Series", latex: "S = a(1 - rⁿ) / (1 - r)", description: "First n terms of geometric series", when: "Series" },
    ],
  },
];

export function getFormulaSheet(courseSlug: string): FormulaSheet | undefined {
  return formulaSheets.find((s) => s.courseSlug === courseSlug);
}
