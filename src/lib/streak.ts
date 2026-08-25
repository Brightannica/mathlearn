export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[];
  streakFreezes: number;
  totalDaysActive: number;
}

const STORAGE_KEY = "mathitout-streak";

export function loadStreakData(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeDates: [],
      streakFreezes: 3,
      totalDaysActive: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StreakData;
    }
  } catch {
    // corrupted data
  }

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activeDates: [],
    streakFreezes: 3,
    totalDaysActive: 0,
  };
}

export function saveStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function recordActivity(): StreakData {
  const data = loadStreakData();
  const today = getTodayString();

  if (data.activeDates.includes(today)) {
    return data;
  }

  data.activeDates.push(today);
  data.totalDaysActive += 1;

  if (!data.lastActiveDate) {
    data.currentStreak = 1;
    data.longestStreak = 1;
  } else if (data.lastActiveDate === today) {
    // Already active today
  } else if (data.lastActiveDate === getYesterdayString()) {
    data.currentStreak += 1;
    data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  } else {
    // Streak broken - more than 1 day gap
    data.currentStreak = 1;
  }

  data.lastActiveDate = today;
  saveStreakData(data);
  return data;
}

export function applyStreakFreeze(): boolean {
  const data = loadStreakData();
  const today = getTodayString();

  if (data.streakFreezes > 0 && data.currentStreak > 0) {
    const lastActive = data.lastActiveDate;
    if (lastActive && lastActive !== today && lastActive !== getYesterdayString()) {
      // Streak is broken, use a freeze
      data.streakFreezes -= 1;
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
      data.activeDates.push(today);
      data.lastActiveDate = today;
      data.totalDaysActive += 1;
      saveStreakData(data);
      return true;
    }
  }
  return false;
}

export function getStreakStatus(): { current: number; longest: number; activeToday: boolean; canFreeze: boolean } {
  const data = loadStreakData();
  const today = getTodayString();
  const activeToday = data.activeDates.includes(today);
  const streakBroken = data.lastActiveDate && data.lastActiveDate !== today && data.lastActiveDate !== getYesterdayString();

  return {
    current: data.currentStreak,
    longest: data.longestStreak,
    activeToday,
    canFreeze: data.streakFreezes > 0 && Boolean(streakBroken) && data.currentStreak > 0,
  };
}
