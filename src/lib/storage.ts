const BEST_KEY = "signal_best";
const STREAK_KEY = "signal_streak";
const LAST_DAY_KEY = "signal_last_day";

export type SavedStats = {
  bestScore: number;
  streak: number;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadStats(): SavedStats {
  try {
    return {
      bestScore: parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10),
      streak: parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10),
    };
  } catch {
    return { bestScore: 0, streak: 0 };
  }
}

export function recordVisit(): SavedStats {
  try {
    const day = today();
    const last = localStorage.getItem(LAST_DAY_KEY);
    let streak = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10);

    if (last === day) {
      return loadStats();
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    streak = last === yStr ? streak + 1 : 1;
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_DAY_KEY, day);
    return loadStats();
  } catch {
    return loadStats();
  }
}

export function saveBestScore(score: number): boolean {
  try {
    const prev = parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10);
    if (score > prev) {
      localStorage.setItem(BEST_KEY, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
