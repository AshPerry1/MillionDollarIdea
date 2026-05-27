import type { CountryEconomics } from "./types";

const DEFAULT: CountryEconomics = {
  name: "United States",
  medianAnnualIncomeUSD: 74_000,
  avgRentMonthlyUSD: 1_800,
  colIndex: 100,
};

export const COUNTRY_ECONOMICS: Record<string, CountryEconomics> = {
  US: DEFAULT,
  CA: {
    name: "Canada",
    medianAnnualIncomeUSD: 58_000,
    avgRentMonthlyUSD: 1_600,
    colIndex: 92,
  },
  GB: {
    name: "United Kingdom",
    medianAnnualIncomeUSD: 42_000,
    avgRentMonthlyUSD: 1_400,
    colIndex: 105,
  },
  AU: {
    name: "Australia",
    medianAnnualIncomeUSD: 55_000,
    avgRentMonthlyUSD: 1_700,
    colIndex: 98,
  },
  DE: {
    name: "Germany",
    medianAnnualIncomeUSD: 52_000,
    avgRentMonthlyUSD: 1_100,
    colIndex: 88,
  },
  FR: {
    name: "France",
    medianAnnualIncomeUSD: 45_000,
    avgRentMonthlyUSD: 1_000,
    colIndex: 90,
  },
  IN: {
    name: "India",
    medianAnnualIncomeUSD: 8_500,
    avgRentMonthlyUSD: 350,
    colIndex: 28,
  },
  BR: {
    name: "Brazil",
    medianAnnualIncomeUSD: 12_000,
    avgRentMonthlyUSD: 450,
    colIndex: 35,
  },
  MX: {
    name: "Mexico",
    medianAnnualIncomeUSD: 14_000,
    avgRentMonthlyUSD: 500,
    colIndex: 38,
  },
  JP: {
    name: "Japan",
    medianAnnualIncomeUSD: 40_000,
    avgRentMonthlyUSD: 900,
    colIndex: 95,
  },
  KR: {
    name: "South Korea",
    medianAnnualIncomeUSD: 38_000,
    avgRentMonthlyUSD: 850,
    colIndex: 82,
  },
  CN: {
    name: "China",
    medianAnnualIncomeUSD: 18_000,
    avgRentMonthlyUSD: 600,
    colIndex: 45,
  },
  NG: {
    name: "Nigeria",
    medianAnnualIncomeUSD: 5_500,
    avgRentMonthlyUSD: 280,
    colIndex: 22,
  },
  ZA: {
    name: "South Africa",
    medianAnnualIncomeUSD: 11_000,
    avgRentMonthlyUSD: 420,
    colIndex: 32,
  },
  AE: {
    name: "UAE",
    medianAnnualIncomeUSD: 48_000,
    avgRentMonthlyUSD: 1_500,
    colIndex: 78,
  },
  SG: {
    name: "Singapore",
    medianAnnualIncomeUSD: 72_000,
    avgRentMonthlyUSD: 2_200,
    colIndex: 115,
  },
  NL: {
    name: "Netherlands",
    medianAnnualIncomeUSD: 54_000,
    avgRentMonthlyUSD: 1_300,
    colIndex: 94,
  },
  SE: {
    name: "Sweden",
    medianAnnualIncomeUSD: 50_000,
    avgRentMonthlyUSD: 1_050,
    colIndex: 96,
  },
  NO: {
    name: "Norway",
    medianAnnualIncomeUSD: 62_000,
    avgRentMonthlyUSD: 1_200,
    colIndex: 108,
  },
  CH: {
    name: "Switzerland",
    medianAnnualIncomeUSD: 85_000,
    avgRentMonthlyUSD: 1_800,
    colIndex: 125,
  },
  IE: {
    name: "Ireland",
    medianAnnualIncomeUSD: 52_000,
    avgRentMonthlyUSD: 1_500,
    colIndex: 102,
  },
  PL: {
    name: "Poland",
    medianAnnualIncomeUSD: 22_000,
    avgRentMonthlyUSD: 550,
    colIndex: 48,
  },
  PH: {
    name: "Philippines",
    medianAnnualIncomeUSD: 7_500,
    avgRentMonthlyUSD: 320,
    colIndex: 26,
  },
  PK: {
    name: "Pakistan",
    medianAnnualIncomeUSD: 6_000,
    avgRentMonthlyUSD: 250,
    colIndex: 20,
  },
  AR: {
    name: "Argentina",
    medianAnnualIncomeUSD: 10_000,
    avgRentMonthlyUSD: 400,
    colIndex: 30,
  },
  CO: {
    name: "Colombia",
    medianAnnualIncomeUSD: 11_500,
    avgRentMonthlyUSD: 420,
    colIndex: 33,
  },
  NZ: {
    name: "New Zealand",
    medianAnnualIncomeUSD: 48_000,
    avgRentMonthlyUSD: 1_400,
    colIndex: 90,
  },
  IT: {
    name: "Italy",
    medianAnnualIncomeUSD: 38_000,
    avgRentMonthlyUSD: 900,
    colIndex: 85,
  },
  ES: {
    name: "Spain",
    medianAnnualIncomeUSD: 35_000,
    avgRentMonthlyUSD: 850,
    colIndex: 80,
  },
  PT: {
    name: "Portugal",
    medianAnnualIncomeUSD: 28_000,
    avgRentMonthlyUSD: 750,
    colIndex: 72,
  },
  TH: {
    name: "Thailand",
    medianAnnualIncomeUSD: 12_000,
    avgRentMonthlyUSD: 380,
    colIndex: 34,
  },
  VN: {
    name: "Vietnam",
    medianAnnualIncomeUSD: 9_000,
    avgRentMonthlyUSD: 350,
    colIndex: 30,
  },
  EG: {
    name: "Egypt",
    medianAnnualIncomeUSD: 7_000,
    avgRentMonthlyUSD: 280,
    colIndex: 24,
  },
  KE: {
    name: "Kenya",
    medianAnnualIncomeUSD: 8_000,
    avgRentMonthlyUSD: 300,
    colIndex: 25,
  },
};

export function getEconomics(countryCode: string): CountryEconomics {
  return COUNTRY_ECONOMICS[countryCode.toUpperCase()] ?? DEFAULT;
}
