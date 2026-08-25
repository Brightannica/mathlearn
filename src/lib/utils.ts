import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(d => new Date(d).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const firstDate = sortedDates[0];
  if (firstDate !== today && firstDate !== yesterday) {
    return 0;
  }
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]).getTime();
    const curr = new Date(sortedDates[i]).getTime();
    const diffDays = Math.floor((prev - curr) / 86400000);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(xp: number): { level: number; progress: number; nextLevelXP: number } {
  let level = 1;
  let totalXP = 0;
  let nextLevelXP = 100;
  
  while (totalXP + nextLevelXP <= xp) {
    totalXP += nextLevelXP;
    level++;
    nextLevelXP = getXPForLevel(level);
  }
  
  const progress = ((xp - totalXP) / nextLevelXP) * 100;
  
  return { level, progress, nextLevelXP: totalXP + nextLevelXP };
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    "K": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    "1": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    "2": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    "3": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "4": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    "5": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
    "6": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "7": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    "8": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    "9": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    "10": "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    "11": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "12": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  };
  return colors[grade] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    "easy": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    "hard": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 90) return "bg-green-500";
  if (mastery >= 70) return "bg-blue-500";
  if (mastery >= 50) return "bg-yellow-500";
  if (mastery >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}