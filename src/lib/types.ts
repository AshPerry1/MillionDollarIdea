export type CountryEconomics = {
  name: string;
  medianAnnualIncomeUSD: number;
  avgRentMonthlyUSD: number;
  colIndex: number;
};

export type GeoData = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type VisitorSignals = {
  language: string;
  languages: string[];
  timezone: string;
  localTime: string;
  dayOfWeek: string;
  hour: number;
  device: "mobile" | "tablet" | "desktop";
  screenBucket: string;
  prefersDark: boolean;
  isReturning: boolean;
  visitCount: number;
  referrer: string;
};

export type MillionReport = {
  geo: GeoData;
  visitor: VisitorSignals;
  millionId: string;
  yearsToEarn: number;
  rentYears: number;
  coffeeCups: number;
  millionPower: number;
  nycComparison: string;
  hourRarity: number;
  headline: string;
  subheadline: string;
};
