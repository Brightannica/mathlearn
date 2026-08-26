// FSRS (Free Spaced Repetition Scheduler) - simplified v4 implementation
// Based on https://github.com/open-spaced-repetition/ts-fsrs

export type Rating = 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy

export type ReviewState = {
  difficulty: number;     // 1-10, card difficulty
  stability: number;       // days, how stable the memory is
  retrievability: number;   // 0-1, probability of recall
  interval: number;        // days until next review
  reps: number;            // total successful reviews
  lapses: number;          // times forgotten
  lastReview: string;      // ISO date
  dueDate: string;         // ISO date
};

// FSRS default parameters
const W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const S_MIN = 0.01;
const S_MAX = 36500;
const R_TARGET = 0.9;
const R_MIN = 0.7;
const R_MAX = 0.97;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 86400000);
}

function forgettingCurve(elapsedDays: number, stability: number): number {
  return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
}

export function newCard(now: Date = new Date()): ReviewState {
  return {
    difficulty: 5,
    stability: S_MIN,
    retrievability: 1,
    interval: 0,
    reps: 0,
    lapses: 0,
    lastReview: now.toISOString(),
    dueDate: now.toISOString(),
  };
}

export function scheduleReview(state: ReviewState, rating: Rating, now: Date = new Date()): ReviewState {
  const last = new Date(state.lastReview);
  const elapsed = daysBetween(last, now);
  const r = forgettingCurve(elapsed, state.stability);

  let { difficulty, stability, retrievability, reps, lapses } = state;

  if (rating === 1) {
    // Again - lapse
    lapses += 1;
    difficulty = clamp(difficulty - W[6] * (rating - 3), 1, 10);
    stability = S_MIN;
    retrievability = 0.9;
  } else {
    // Update difficulty
    difficulty = clamp(difficulty - W[5] * (rating - 3), 1, 10);

    // Update stability
    if (rating === 2) {
      stability = stability * (1 + (W[15] * Math.pow(difficulty, -W[16]) * (elapsed / stability) * (Math.pow(r, W[8]) - 1)));
    } else if (rating === 3) {
      stability = stability * (1 + (W[8] * Math.pow(difficulty, -W[9]) * (Math.pow(elapsed, -W[10]) * (Math.pow(r, W[11]) - 1))));
    } else {
      stability = stability * (1 + (W[12] * Math.pow(difficulty, -W[13]) * (Math.pow(elapsed, -W[14]) * (Math.pow(r, W[15]) - 1))));
    }

    stability = clamp(stability, S_MIN, S_MAX);
    retrievability = forgettingCurve(elapsed, stability);
    reps += 1;
  }

  // Compute next interval
  let interval: number;
  if (rating === 1) {
    interval = 1; // review again tomorrow
  } else {
    const factor = 1 / R_TARGET - 1;
    interval = stability / 9 * (factor * (1 / retrievability - 1)) ** (1 / DECAY);
  }

  interval = Math.max(1, Math.round(interval));

  const dueDate = new Date(now.getTime() + interval * 86400000);

  return {
    difficulty,
    stability,
    retrievability,
    interval,
    reps,
    lapses,
    lastReview: now.toISOString(),
    dueDate: dueDate.toISOString(),
  };
}

export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return new Date(state.dueDate) <= now;
}

export function formatInterval(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? "" : "s"}`;
  if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"}`;
  return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? "" : "s"}`;
}
