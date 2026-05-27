import type { VisitorSignals } from "./types";

const VISIT_KEY = "mdi_visits";

function getDevice(): VisitorSignals["device"] {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getScreenBucket(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 400) return "compact";
  if (w < 768) return "standard-mobile";
  if (w < 1280) return "standard";
  return "wide";
}

export function collectVisitorSignals(): VisitorSignals {
  const now = new Date();
  const visitCount = incrementVisitCount();

  return {
    language: navigator.language,
    languages: [...navigator.languages].slice(0, 3),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localTime: now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
    dayOfWeek: now.toLocaleDateString(undefined, { weekday: "long" }),
    hour: now.getHours(),
    device: getDevice(),
    screenBucket: getScreenBucket(),
    prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    isReturning: visitCount > 1,
    visitCount,
    referrer: document.referrer ? new URL(document.referrer).hostname : "direct",
  };
}

function incrementVisitCount(): number {
  try {
    const prev = parseInt(localStorage.getItem(VISIT_KEY) ?? "0", 10);
    const next = prev + 1;
    localStorage.setItem(VISIT_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}
