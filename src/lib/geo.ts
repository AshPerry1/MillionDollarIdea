import type { GeoData } from "./types";

const FALLBACK: GeoData = {
  city: "Unknown",
  region: "",
  country: "Earth",
  countryCode: "XX",
  latitude: 0,
  longitude: 0,
};

type IpApiResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
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
      countryCode: (data.country_code || "XX").toUpperCase(),
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
    };
  } catch {
    return FALLBACK;
  }
}
