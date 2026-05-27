export function generateMillionId(
  countryCode: string,
  timezone: string,
  language: string,
  hour: number,
): string {
  const seed = `${countryCode}|${timezone}|${language}|${hour}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash) % 1_000_000;
  return `MDI-${num.toString().padStart(6, "0")}`;
}

export function hourRarityPercent(hour: number, countryCode: string): number {
  let h = hour;
  for (const c of countryCode) h = (h + c.charCodeAt(0)) % 24;
  const night = h < 6 || h >= 23;
  const morning = h >= 6 && h < 9;
  const work = h >= 9 && h < 17;
  if (night) return 4 + (h % 5);
  if (morning) return 12 + (h % 8);
  if (work) return 38 + (h % 15);
  return 18 + (h % 12);
}
