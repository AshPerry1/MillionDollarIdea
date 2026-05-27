import { getEconomics } from "./countryEconomics";
import { generateMillionId, hourRarityPercent } from "./millionId";
import type { GeoData, MillionReport, VisitorSignals } from "./types";

const NYC_COL = 100;
const COFFEE_USD = 5.5;

function formatYears(years: number): number {
  return Math.round(years * 10) / 10;
}

function timeGreeting(hour: number): string {
  if (hour < 5) return "the quiet hours";
  if (hour < 12) return "the morning";
  if (hour < 17) return "the afternoon";
  if (hour < 21) return "the evening";
  return "the night";
}

export function buildMillionReport(
  geo: GeoData,
  visitor: VisitorSignals,
): MillionReport {
  const econ = getEconomics(geo.countryCode);
  const yearsToEarn = formatYears(1_000_000 / econ.medianAnnualIncomeUSD);
  const rentYears = formatYears(
    1_000_000 / (econ.avgRentMonthlyUSD * 12),
  );
  const coffeeCups = Math.round(1_000_000 / COFFEE_USD);
  const millionPower = Math.round((NYC_COL / econ.colIndex) * 100);
  const hourRarity = hourRarityPercent(visitor.hour, geo.countryCode);
  const millionId = generateMillionId(
    geo.countryCode,
    visitor.timezone,
    visitor.language,
    visitor.hour,
  );

  const locationLabel = geo.region
    ? `${geo.city}, ${geo.region}`
    : geo.city;

  const nycComparison =
    millionPower > 100
      ? `${millionPower}% more purchasing power than NYC`
      : millionPower < 100
        ? `${100 - millionPower}% less purchasing power than NYC`
        : "roughly equal purchasing power to NYC";

  const headline =
    millionPower >= 150
      ? `In ${geo.city}, a million goes further than you think.`
      : millionPower <= 70
        ? `In ${geo.city}, a million isn't what it used to be.`
        : `In ${geo.city}, here's what a million really means.`;

  const subheadline = `You're viewing this during ${timeGreeting(visitor.hour)} on a ${visitor.device} — only about ${hourRarity}% of visitors land here at this hour.`;

  return {
    geo,
    visitor,
    millionId,
    yearsToEarn,
    rentYears,
    coffeeCups,
    millionPower,
    nycComparison,
    hourRarity,
    headline,
    subheadline,
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function getLocationLabel(geo: GeoData): string {
  return geo.region ? `${geo.city}, ${geo.region}` : geo.city;
}
