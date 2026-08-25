import { loadStreakData, getTodayString, getYesterdayString, recordActivity } from "@/lib/streak";

describe("streak utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default streak data when nothing stored", () => {
    const data = loadStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.longestStreak).toBe(0);
    expect(data.activeDates).toEqual([]);
  });

  it("records activity for today", () => {
    const data = recordActivity();
    expect(data.activeDates).toContain(getTodayString());
    expect(data.currentStreak).toBe(1);
  });

  it("calculates yesterday string correctly", () => {
    const yesterday = getYesterdayString();
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(expected.getDate() - 1);
    expect(yesterday).toBe(expected.toISOString().split("T")[0]);
  });
});
