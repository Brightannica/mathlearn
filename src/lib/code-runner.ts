export type RunResult = {
  passed: boolean;
  total: number;
  passedCount: number;
  results: { name: string; passed: boolean; error?: string; got?: unknown; expected?: unknown }[];
  error?: string;
};

export async function runUserCode(
  userCode: string,
  functionName: string,
  testCases: { input: Record<string, unknown>; expected: unknown }[]
): Promise<RunResult> {
  const results: RunResult["results"] = [];
  let fn: ((...args: unknown[]) => unknown) | null = null;
  let setupError: string | undefined;

  try {
    // Build a sandboxed function from user code
    // We append a return of the named function so the caller can access it.
    const wrapped = `${userCode}\n;return ${functionName};`;
    // eslint-disable-next-line no-new-func
    const factory = new Function(wrapped);
    fn = factory();
    if (typeof fn !== "function") {
      setupError = `Function "${functionName}" is not defined. Make sure you declare it.`;
    }
  } catch (err) {
    setupError = err instanceof Error ? err.message : "Syntax error in your code.";
  }

  if (setupError || !fn) {
    return {
      passed: false,
      total: testCases.length,
      passedCount: 0,
      results: testCases.map((tc) => ({ name: describe(tc.input), passed: false, error: setupError })),
      error: setupError,
    };
  }

  let passedCount = 0;
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const args = Object.values(tc.input);
    try {
      const got = fn(...args);
      const passed = deepEqual(got, tc.expected);
      if (passed) passedCount++;
      results.push({
        name: `case ${i + 1}: ${describe(tc.input)}`,
        passed,
        got,
        expected: tc.expected,
      });
    } catch (err) {
      results.push({
        name: `case ${i + 1}: ${describe(tc.input)}`,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
        expected: tc.expected,
      });
    }
  }

  return {
    passed: passedCount === testCases.length,
    total: testCases.length,
    passedCount,
    results,
  };
}

function describe(input: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(input)) {
    parts.push(`${k}=${JSON.stringify(v)}`);
  }
  return `(${parts.join(", ")})`;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return Math.abs(a - b) < 1e-2;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object" && a && b) {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}
