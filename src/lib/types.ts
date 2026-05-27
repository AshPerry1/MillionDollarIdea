export type GeoData = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

export type VisitorSignals = {
  timezone: string;
  localTime: string;
  hour: number;
  dayOfWeek: string;
  season: string;
  language: string;
  languages: string[];
  device: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  screen: string;
  pixelRatio: number;
  colorDepth: number;
  touch: boolean;
  cores: number;
  memoryGB: number | null;
  connection: string;
  prefersDark: boolean;
  prefersReducedMotion: boolean;
  cookiesEnabled: boolean;
  referrer: string;
  visitCount: number;
  isReturning: boolean;
};

export type SignalProfile = {
  geo: GeoData;
  signals: VisitorSignals;
  signalId: string;
  archetype: Archetype;
  colors: { primary: string; glow: string; accent: string };
  beatWindowMs: number;
  glyphSeed: number;
};

export type Archetype = {
  name: string;
  title: string;
  tagline: string;
  trait: string;
};

export type GameResult = {
  score: number;
  perfect: number;
  good: number;
  miss: number;
  rank: string;
  syncPercent: number;
  maxCombo: number;
};
