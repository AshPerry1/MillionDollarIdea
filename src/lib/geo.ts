import type { GeoData } from "./types";

const FALLBACK: GeoData = {
  city: "Your city",
  region: "",
  country: "United States",
  countryCode: "US",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

type IpApiResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  error?: boolean;
};

export async function fetchGeo(): Promise<GeoData> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as IpApiResponse;
    if (data.error) return FALLBACK;

    return {
      city: data.city || FALLBACK.city,
      region: data.region || "",
      country: data.country_name || FALLBACK.country,
      countryCode: (data.country_code || "US").toUpperCase(),
      latitude: data.latitude ?? FALLBACK.latitude,
      longitude: data.longitude ?? FALLBACK.longitude,
      timezone: data.timezone || FALLBACK.timezone,
    };
  } catch {
    return FALLBACK;
  }
}
