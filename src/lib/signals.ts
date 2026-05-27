import type { VisitorSignals } from "./types";

const VISIT_KEY = "signal_visits";

function parseUA(): { os: string; browser: string } {
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS/.test(ua)) os = "macOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";

  return { os, browser };
}

function getDevice(): VisitorSignals["device"] {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function getConnection(): string {
  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number };
    }
  ).connection;
  if (!conn?.effectiveType) return "unknown";
  return conn.downlink
    ? `${conn.effectiveType} · ${conn.downlink}Mbps`
    : conn.effectiveType;
}

export function collectSignals(): VisitorSignals {
  const now = new Date();
  const { os, browser } = parseUA();
  const visitCount = incrementVisits();
  const w = window.innerWidth;
  const h = window.innerHeight;

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localTime: now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
    hour: now.getHours(),
    dayOfWeek: now.toLocaleDateString(undefined, { weekday: "long" }),
    season: getSeason(now.getMonth()),
    language: navigator.language,
    languages: [...navigator.languages].slice(0, 4),
    device: getDevice(),
    os,
    browser,
    screen: `${w}×${h}`,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    cores: navigator.hardwareConcurrency ?? 0,
    memoryGB:
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
      null,
    connection: getConnection(),
    prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    prefersReducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches,
    cookiesEnabled: navigator.cookieEnabled,
    referrer: document.referrer
      ? new URL(document.referrer).hostname
      : "direct",
    visitCount,
    isReturning: visitCount > 1,
  };
}

function incrementVisits(): number {
  try {
    const prev = parseInt(localStorage.getItem(VISIT_KEY) ?? "0", 10);
    const next = prev + 1;
    localStorage.setItem(VISIT_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}
