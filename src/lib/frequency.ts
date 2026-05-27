import type { Archetype, GeoData, SignalProfile, VisitorSignals } from "./types";

const ARCHETYPES: Archetype[] = [
  {
    name: "Night Courier",
    title: "You move when the world sleeps",
    tagline: "Late signal. Fast hands.",
    trait: "Speed",
  },
  {
    name: "Dawn Architect",
    title: "You build before anyone wakes",
    tagline: "Early light. Clear mind.",
    trait: "Precision",
  },
  {
    name: "Static Monk",
    title: "You arrive with intention",
    tagline: "Quiet tab. Deep focus.",
    trait: "Patience",
  },
  {
    name: "Border Runner",
    title: "You exist between places",
    tagline: "Edge of the map.",
    trait: "Instinct",
  },
  {
    name: "Chrome Phantom",
    title: "You slip through the grid",
    tagline: "Mobile. Untethered.",
    trait: "Agility",
  },
  {
    name: "Deep Current",
    title: "You ride the bandwidth",
    tagline: "Fast pipe. Sharp reflex.",
    trait: "Flow",
  },
  {
    name: "Return Pulse",
    title: "The signal remembers you",
    tagline: "Second visit. Stronger wave.",
    trait: "Memory",
  },
  {
    name: "First Spark",
    title: "Fresh frequency detected",
    tagline: "New arrival. Raw potential.",
    trait: "Chaos",
  },
  {
    name: "Winter Node",
    title: "Cold season. Hot timing",
    tagline: "Seasonal drift locked.",
    trait: "Endurance",
  },
  {
    name: "Summer Surge",
    title: "Peak heat. Peak sync",
    tagline: "High sun. High score.",
    trait: "Power",
  },
  {
    name: "Touch Drift",
    title: "Fingers on glass",
    tagline: "Tap-native hunter.",
    trait: "Touch",
  },
  {
    name: "Keystroke Ghost",
    title: "Keyboard warrior",
    tagline: "Desktop depth charge.",
    trait: "Control",
  },
  {
    name: "Low Tide",
    title: "Slow connection. Sharp mind",
    tagline: "You wait. Then strike.",
    trait: "Timing",
  },
  {
    name: "Multilingual Wave",
    title: "Many tongues. One rhythm",
    tagline: "Language stack detected.",
    trait: "Harmony",
  },
  {
    name: "Direct Line",
    title: "You came straight here",
    tagline: "No referrer. Pure intent.",
    trait: "Focus",
  },
  {
    name: "Relay Host",
    title: "Sent here by someone",
    tagline: "Word travels.",
    trait: "Link",
  },
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickArchetype(signals: VisitorSignals, geo: GeoData): Archetype {
  const h = signals.hour;
  const idx =
    (h +
      signals.device.length +
      geo.countryCode.charCodeAt(0) +
      (signals.isReturning ? 7 : 0) +
      (signals.touch ? 3 : 0) +
      signals.season.length) %
    ARCHETYPES.length;
  return ARCHETYPES[idx]!;
}

export function buildSignalProfile(
  geo: GeoData,
  signals: VisitorSignals,
): SignalProfile {
  const seed = `${geo.countryCode}|${geo.city}|${signals.timezone}|${signals.language}|${signals.hour}|${signals.device}`;
  const h = hash(seed);
  const signalId = `SIG-${(h % 1_000_000).toString().padStart(6, "0")}`;
  const hue = h % 360;

  return {
    geo,
    signals,
    signalId,
    archetype: pickArchetype(signals, geo),
    colors: {
      primary: `hsl(${hue}, 85%, 60%)`,
      glow: `hsl(${hue}, 90%, 50%)`,
      accent: `hsl(${(hue + 140) % 360}, 80%, 65%)`,
    },
    beatWindowMs: 120 + (h % 80),
    glyphSeed: h,
  };
}

export function getLocationLabel(geo: GeoData): string {
  return geo.region ? `${geo.city}, ${geo.region}` : geo.city;
}

export function rankFromScore(score: number): string {
  if (score >= 95) return "Legendary sync";
  if (score >= 80) return "Strong signal";
  if (score >= 60) return "Stable wave";
  if (score >= 40) return "Drifting";
  return "Static noise";
}

export function syncPercentile(score: number, signalId: string): number {
  const h = hash(signalId);
  const base = Math.min(97, Math.max(8, score - 10 + (h % 25)));
  return base;
}
