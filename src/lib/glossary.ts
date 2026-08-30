export type GlossaryTerm = {
  term: string;
  definition: string;
  example?: string;
  related?: string[];
  category: "algebra" | "geometry" | "calculus" | "statistics" | "arithmetic" | "trigonometry" | "general";
};

export const glossary: GlossaryTerm[] = [
  // Algebra
  { term: "variable", definition: "a symbol (usually a letter) that represents an unknown or changeable value.", example: "in x + 3 = 7, x is the variable.", category: "algebra" },
  { term: "coefficient", definition: "the numerical factor of a term.", example: "in 3x², 3 is the coefficient.", category: "algebra" },
  { term: "polynomial", definition: "an algebraic expression with one or more terms, each being a constant times a non-negative integer power of a variable.", example: "3x² + 2x − 5 is a polynomial.", category: "algebra" },
  { term: "monomial", definition: "an algebraic expression with exactly one term.", example: "5x³ is a monomial.", category: "algebra" },
  { term: "binomial", definition: "an algebraic expression with exactly two terms.", example: "x + 3 is a binomial.", category: "algebra" },
  { term: "quadratic", definition: "a polynomial of degree 2. has the form ax² + bx + c.", example: "x² + 5x + 6 is quadratic.", category: "algebra", related: ["parabola", "discriminant"] },
  { term: "parabola", definition: "the U-shaped graph of a quadratic function.", example: "y = x² is a parabola opening upward.", category: "algebra" },
  { term: "discriminant", definition: "in a quadratic ax² + bx + c, the discriminant is b² − 4ac. it tells you how many real roots exist.", example: "if b² − 4ac > 0, two real roots. if = 0, one. if < 0, none.", category: "algebra" },
  { term: "vertex", definition: "the highest or lowest point of a parabola. for y = a(x − h)² + k, the vertex is (h, k).", example: "y = (x − 3)² + 4 has vertex (3, 4).", category: "algebra" },
  { term: "root", definition: "a value of the variable that makes an equation equal zero.", example: "x = 2 is a root of x² − 4 = 0.", category: "algebra" },
  { term: "slope", definition: "the steepness of a line. rise over run. (y₂ − y₁) / (x₂ − x₁).", example: "a line passing through (0, 0) and (2, 4) has slope 2.", category: "algebra" },
  { term: "y-intercept", definition: "the y-value where a line crosses the y-axis. in y = mx + b, the y-intercept is b.", example: "y = 3x + 5 crosses the y-axis at (0, 5).", category: "algebra" },
  { term: "FOIL", definition: "a method for multiplying binomials: First, Outer, Inner, Last.", example: "(x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6.", category: "algebra" },
  { term: "factoring", definition: "rewriting an expression as a product of factors.", example: "x² + 5x + 6 factors to (x + 2)(x + 3).", category: "algebra" },
  { term: "exponent", definition: "the number that indicates how many times a base is multiplied by itself.", example: "in 2³, 3 is the exponent and 2 is the base.", category: "algebra" },

  // Geometry
  { term: "perimeter", definition: "the total distance around a 2D shape.", example: "perimeter of a rectangle = 2(length + width).", category: "geometry" },
  { term: "area", definition: "the amount of space inside a 2D shape, measured in square units.", example: "area of a triangle = ½ × base × height.", category: "geometry" },
  { term: "volume", definition: "the amount of space inside a 3D shape, measured in cubic units.", example: "volume of a sphere = (4/3)πr³.", category: "geometry" },
  { term: "circumference", definition: "the distance around a circle.", example: "circumference = 2πr.", category: "geometry" },
  { term: "diameter", definition: "a chord that passes through the center of a circle. twice the radius.", example: "if r = 5, d = 10.", category: "geometry" },
  { term: "hypotenuse", definition: "the longest side of a right triangle, opposite the right angle.", example: "in a 3-4-5 triangle, the hypotenuse is 5.", category: "geometry" },
  { term: "pythagorean theorem", definition: "in a right triangle, a² + b² = c², where c is the hypotenuse.", example: "for legs 3 and 4, c = √(9 + 16) = 5.", category: "geometry" },
  { term: "similar triangles", definition: "triangles with the same shape but different sizes. corresponding sides are proportional.", example: "a 3-4-5 triangle is similar to a 6-8-10 triangle.", category: "geometry" },
  { term: "congruent", definition: "identical in shape and size.", example: "two triangles with the same side lengths are congruent.", category: "geometry" },
  { term: "polygon", definition: "a closed 2D shape with three or more straight sides.", example: "triangles, squares, and pentagons are polygons.", category: "geometry" },
  { term: "angle", definition: "the amount of rotation between two rays sharing an endpoint, measured in degrees or radians.", example: "a right angle is 90° or π/2 radians.", category: "geometry" },

  // Arithmetic
  { term: "prime number", definition: "a natural number greater than 1 that has no positive divisors other than 1 and itself.", example: "2, 3, 5, 7, 11, 13 are primes.", category: "arithmetic" },
  { term: "composite number", definition: "a positive integer that has at least one divisor other than 1 and itself.", example: "4, 6, 8, 9, 10 are composite.", category: "arithmetic" },
  { term: "greatest common divisor (GCD)", definition: "the largest positive integer that divides two or more numbers without a remainder.", example: "GCD(12, 18) = 6.", category: "arithmetic" },
  { term: "least common multiple (LCM)", definition: "the smallest positive integer that is divisible by two or more numbers.", example: "LCM(4, 6) = 12.", category: "arithmetic" },
  { term: "percentage", definition: "a number or ratio expressed as a fraction of 100.", example: "50% = 50/100 = ½.", category: "arithmetic" },
  { term: "ratio", definition: "a comparison of two quantities by division.", example: "the ratio 3:4 means 3/4.", category: "arithmetic" },
  { term: "decimal", definition: "a number expressed in base 10, using a decimal point to separate whole from fractional parts.", example: "0.75 = ¾.", category: "arithmetic" },
  { term: "fraction", definition: "a number expressed as a/b where b ≠ 0.", example: "¾ = 0.75 = 75%.", category: "arithmetic" },

  // Calculus
  { term: "derivative", definition: "the rate of change of a function at a point. the slope of the tangent line.", example: "d/dx[x²] = 2x.", category: "calculus" },
  { term: "integral", definition: "the area under a curve. the antiderivative of a function.", example: "∫x² dx = x³/3 + C.", category: "calculus" },
  { term: "power rule", definition: "d/dx[xⁿ] = n·xⁿ⁻¹. for integrals, ∫xⁿ dx = xⁿ⁺¹/(n+1) + C.", example: "d/dx[x⁴] = 4x³.", category: "calculus" },
  { term: "chain rule", definition: "d/dx[f(g(x))] = f'(g(x)) · g'(x). used for composite functions.", example: "d/dx[sin(x²)] = 2x·cos(x²).", category: "calculus" },
  { term: "product rule", definition: "d/dx[fg] = f'g + fg'. used when multiplying two functions.", example: "d/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x).", category: "calculus" },
  { term: "quotient rule", definition: "d/dx[f/g] = (f'g − fg') / g². used when dividing two functions.", category: "calculus" },
  { term: "limit", definition: "the value a function approaches as its input approaches some value.", example: "lim(x→0) sin(x)/x = 1.", category: "calculus" },
  { term: "fundamental theorem of calculus", definition: "connects differentiation and integration: ∫ₐᵇ f'(x)dx = f(b) − f(a).", category: "calculus" },
  { term: "antiderivative", definition: "a function whose derivative is the given function.", example: "an antiderivative of 2x is x².", category: "calculus" },

  // Statistics
  { term: "mean", definition: "the arithmetic average. sum of values divided by count.", example: "mean of [2, 4, 6] = (2+4+6)/3 = 4.", category: "statistics" },
  { term: "median", definition: "the middle value of a sorted dataset.", example: "median of [1, 3, 7, 9, 12] = 7.", category: "statistics" },
  { term: "mode", definition: "the most frequently occurring value in a dataset.", example: "mode of [1, 2, 2, 3, 4] = 2.", category: "statistics" },
  { term: "standard deviation", definition: "a measure of spread. average distance from the mean.", example: "std dev of [2, 4, 4, 4, 5, 5, 7, 9] ≈ 2.14.", category: "statistics" },
  { term: "variance", definition: "the square of the standard deviation. average of squared deviations from the mean.", example: "variance of [1, 2, 3] = ⅔ ≈ 0.67.", category: "statistics" },
  { term: "permutation", definition: "an ordered arrangement. nPr = n! / (n−r)!.", example: "P(5,3) = 5×4×3 = 60.", category: "statistics" },
  { term: "combination", definition: "an unordered selection. nCr = n! / (r!(n−r)!).", example: "C(5,3) = 10.", category: "statistics" },
  { term: "probability", definition: "the likelihood of an event, from 0 (impossible) to 1 (certain).", example: "P(rolling a 6) = 1/6.", category: "statistics" },
  { term: "normal distribution", definition: "a symmetric bell-shaped distribution. described by mean and standard deviation.", example: "68% of data within 1 std dev of the mean.", category: "statistics" },

  // Trigonometry
  { term: "sine", definition: "in a right triangle, opposite over hypotenuse.", example: "sin(30°) = ½.", category: "trigonometry" },
  { term: "cosine", definition: "in a right triangle, adjacent over hypotenuse.", example: "cos(60°) = ½.", category: "trigonometry" },
  { term: "tangent", definition: "in a right triangle, opposite over adjacent. also sin/cos.", example: "tan(45°) = 1.", category: "trigonometry" },
  { term: "unit circle", definition: "a circle of radius 1 centered at the origin. used to define trig functions for all angles.", category: "trigonometry" },
  { term: "radian", definition: "the angle subtended at the center of a circle by an arc equal in length to the radius. 2π radians = 360°.", example: "π radians = 180°.", category: "trigonometry" },
  { term: "law of sines", definition: "in any triangle, a/sin(A) = b/sin(B) = c/sin(C).", category: "trigonometry" },
  { term: "law of cosines", definition: "c² = a² + b² − 2ab·cos(C). generalizes the pythagorean theorem.", category: "trigonometry" },
  { term: "identity", definition: "a trigonometric equation that's true for all values. sin²(x) + cos²(x) = 1 is an identity.", category: "trigonometry" },

  // General
  { term: "function", definition: "a relation where each input has exactly one output. f(x) = y.", example: "f(x) = 2x + 1 maps every x to a unique y.", category: "general" },
  { term: "domain", definition: "the set of all valid inputs to a function.", example: "for f(x) = 1/x, the domain is all reals except 0.", category: "general" },
  { term: "range", definition: "the set of all possible outputs of a function.", example: "for f(x) = x², the range is [0, ∞).", category: "general" },
  { term: "asymptote", definition: "a line that a curve approaches but never reaches.", example: "y = 1/x has horizontal asymptote y = 0.", category: "general" },
];

export const glossaryCategories = [
  { id: "all", name: "all" },
  { id: "algebra", name: "algebra" },
  { id: "arithmetic", name: "arithmetic" },
  { id: "geometry", name: "geometry" },
  { id: "statistics", name: "statistics" },
  { id: "calculus", name: "calculus" },
  { id: "trigonometry", name: "trigonometry" },
  { id: "general", name: "general" },
];
