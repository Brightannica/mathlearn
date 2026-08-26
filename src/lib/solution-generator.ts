// Step-by-step solution generator for procedural problems
// Breaks down the solution into clear, educational steps

import { GeneratedProblem } from "@/lib/problem-generator";

export type SolutionStep = {
  title: string;
  content: string;
  formula?: string;
  highlight?: string;
};

export function generateSolutionSteps(p: GeneratedProblem): SolutionStep[] {
  // Try to extract steps from the problem structure
  const steps: SolutionStep[] = [];
  const question = p.question;
  const explanation = p.explanation;

  // Generic: try to identify the type of problem and generate steps
  if (question.includes("Solve for x:")) {
    const match = question.match(/(\d+)?x\s*([+\-−]\s*\d+)?\s*=\s*(\d+)/);
    if (match) {
      const a = match[1] ? parseInt(match[1]) : 1;
      const b = match[2] ? parseInt(match[2].replace(/\s/g, "")) : 0;
      const c = parseInt(match[3]);
      steps.push({
        title: "Identify the equation",
        content: `We have ${a}x ${b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`} = ${c}. This is a linear equation in one variable.`,
        formula: `${a}x ${b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`} = ${c}`,
        highlight: "linear equation",
      });
      if (b !== 0) {
        steps.push({
          title: "Isolate the variable term",
          content: `Subtract ${b} from both sides to get the ${a}x term alone.`,
          formula: `${a}x = ${c - b}`,
        });
      }
      steps.push({
        title: "Solve for x",
        content: `Divide both sides by ${a} to find x.`,
        formula: `x = ${p.answer}`,
        highlight: "answer",
      });
    }
  } else if (question.includes("What is") && question.includes("×")) {
    const match = question.match(/What is (\d+) × (\d+)/);
    if (match) {
      const a = parseInt(match[1]);
      const b = parseInt(match[2]);
      steps.push({
        title: "Understand multiplication",
        content: `${a} × ${b} means adding ${a} to itself ${b} times.`,
        formula: `${a} × ${b} = ${a} + ${a} + ... (${b} times)`,
      });
      steps.push({
        title: "Calculate",
        content: `Add ${a} to itself ${b} times, or use the times table.`,
        formula: `${a} × ${b} = ${p.answer}`,
        highlight: "answer",
      });
    }
  } else if (question.includes("Area of a")) {
    const rectMatch = question.match(/width (\d+) and height (\d+)/);
    if (rectMatch) {
      const w = parseInt(rectMatch[1]);
      const h = parseInt(rectMatch[2]);
      steps.push({
        title: "Recall the formula",
        content: "Area of a rectangle = width × height",
        formula: "A = w × h",
      });
      steps.push({
        title: "Substitute values",
        content: `Plug in w = ${w} and h = ${h}.`,
        formula: `A = ${w} × ${h}`,
      });
      steps.push({
        title: "Calculate",
        content: `Multiply to get the area.`,
        formula: `A = ${p.answer} square units`,
        highlight: "answer",
      });
    }
  } else if (question.includes("triangle")) {
    const baseMatch = question.match(/base (\d+) and height (\d+)/);
    if (baseMatch) {
      const b = parseInt(baseMatch[1]);
      const h = parseInt(baseMatch[2]);
      steps.push({
        title: "Recall the formula",
        content: "Area of a triangle = ½ × base × height",
        formula: "A = ½ × b × h",
      });
      steps.push({
        title: "Substitute values",
        content: `Plug in b = ${b} and h = ${h}.`,
        formula: `A = ½ × ${b} × ${h}`,
      });
      steps.push({
        title: "Calculate",
        content: `First multiply, then divide by 2.`,
        formula: `A = ${(b * h) / 2} square units`,
        highlight: "answer",
      });
    }
  } else if (question.includes("circle")) {
    const rMatch = question.match(/radius (\d+)/);
    if (rMatch) {
      const r = parseInt(rMatch[1]);
      steps.push({
        title: "Recall the formula",
        content: "Area of a circle = π × r²",
        formula: "A = πr²",
      });
      steps.push({
        title: "Substitute values",
        content: `Plug in r = ${r}. Use π ≈ 3.14.`,
        formula: `A = 3.14 × ${r}² = 3.14 × ${r * r}`,
      });
      steps.push({
        title: "Calculate",
        content: `Round to the nearest whole number.`,
        formula: `A ≈ ${p.answer} square units`,
        highlight: "answer",
      });
    }
  } else if (question.includes("Derivative")) {
    if (question.includes("x²") || question.includes("x^2")) {
      const aMatch = question.match(/(\d+)x/);
      const a = aMatch ? parseInt(aMatch[1]) : 1;
      steps.push({
        title: "Apply the power rule",
        content: "For ax^n, the derivative is a·n·x^(n-1)",
        formula: "d/dx[ax^n] = a·n·x^(n-1)",
      });
      steps.push({
        title: "Apply term by term",
        content: `Differentiate each term: the constant disappears, the linear term becomes its coefficient.`,
        formula: `f'(x) = ${2 * a}x ${question.includes("+") ? `+ ${a === 1 ? "" : ""}${a === 1 ? "1" : ""}` : ""}`,
        highlight: "answer",
      });
    } else {
      steps.push({
        title: "Power rule",
        content: "d/dx[x^n] = n·x^(n-1)",
        formula: `d/dx[x^p] = p·x^(p-1)`,
      });
    }
  } else if (question.includes("∫")) {
    steps.push({
      title: "Power rule for integration",
      content: "∫x^n dx = x^(n+1)/(n+1) + C",
      formula: "∫x^n dx = x^(n+1)/(n+1) + C",
    });
    steps.push({
      title: "Apply to the problem",
      content: "Add 1 to the exponent and divide by the new exponent. Don't forget the constant of integration!",
      highlight: "answer",
    });
  } else if (question.includes("Mean") || question.includes("mean")) {
    steps.push({
      title: "Definition of mean",
      content: "Mean = (sum of all values) / (number of values)",
      formula: "μ = Σx / n",
    });
    steps.push({
      title: "Add and divide",
      content: "Sum all the numbers, then divide by the count.",
      highlight: "answer",
    });
  } else if (question.includes("Median")) {
    steps.push({
      title: "Sort the data",
      content: "Arrange the numbers in order from smallest to largest.",
    });
    steps.push({
      title: "Find the middle",
      content: "If odd count, take the center value. If even, average the two middle values.",
      highlight: "answer",
    });
  } else if (question.includes("standard deviation")) {
    steps.push({
      title: "Step 1: Find the mean",
      content: "Calculate the average of all values.",
      formula: "μ = Σx / n",
    });
    steps.push({
      title: "Step 2: Squared deviations",
      content: "Subtract the mean from each value, square the result.",
      formula: "(x - μ)²",
    });
    steps.push({
      title: "Step 3: Variance",
      content: "Average the squared deviations.",
      formula: "σ² = Σ(x - μ)² / n",
    });
    steps.push({
      title: "Step 4: Take the square root",
      content: "The standard deviation is the square root of the variance.",
      formula: "σ = √σ²",
      highlight: "answer",
    });
  } else if (question.includes("hypotenuse")) {
    steps.push({
      title: "Pythagorean theorem",
      content: "For a right triangle, the square of the hypotenuse equals the sum of the squares of the legs.",
      formula: "a² + b² = c²",
    });
    steps.push({
      title: "Solve for c",
      content: "Take the square root of both sides.",
      formula: "c = √(a² + b²)",
      highlight: "answer",
    });
  } else if (question.includes("Sum of the first")) {
    steps.push({
      title: "Gauss's formula",
      content: "The sum of the first n positive integers is n(n+1)/2.",
      formula: "S = n(n+1)/2",
    });
    steps.push({
      title: "Apply",
      content: "Substitute n and calculate.",
      highlight: "answer",
    });
  } else if (question.includes("%")) {
    steps.push({
      title: "Convert percentage to decimal",
      content: "Divide by 100.",
      formula: "p% = p/100",
    });
    steps.push({
      title: "Multiply",
      content: "Multiply the decimal by the number.",
      highlight: "answer",
    });
  }

  // If no specific steps were generated, fall back to the explanation
  if (steps.length === 0 && explanation) {
    steps.push({
      title: "Solution",
      content: explanation,
      highlight: "answer",
    });
  }

  return steps;
}
