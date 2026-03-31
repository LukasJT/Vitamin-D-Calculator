/**
 * Geocoding and external data API wrappers.
 *
 * Uses free, no-API-key services:
 * - Nominatim (OpenStreetMap) for geocoding
 * - Open-Meteo for elevation and cloud cover
 *
 * All values can be overridden manually in the UI.
 */

/**
 * Forward geocode: search for a location by name.
 * Uses Nominatim (OpenStreetMap) — free, max 1 req/sec.
 *
 * https://nominatim.org/release-docs/develop/api/Search/
 */
export async function searchLocation(query: string): Promise<{
  lat: number;
  lon: number;
  name: string;
} | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VitaminDCalculator/1.0' },
    });
    const data = await res.json();
    if (data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      name: data[0].display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Reverse geocode: get location name from coordinates.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VitaminDCalculator/1.0' },
    });
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } catch {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

/**
 * Get elevation for coordinates using Open-Meteo Elevation API.
 * Free, no API key required.
 *
 * https://open-meteo.com/en/docs/elevation-api
 */
export async function getElevation(lat: number, lon: number): Promise<number> {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.elevation?.[0] ?? 0) / 1000; // Convert meters to km
  } catch {
    return 0;
  }
}

/**
 * Get monthly average cloud cover for coordinates using Open-Meteo Climate API.
 * Returns array of 12 values (one per month, 0-100%).
 *
 * https://open-meteo.com/en/docs/climate-api
 */
export async function getMonthlyCloudCover(lat: number, lon: number): Promise<number[]> {
  try {
    // Use ERA5 climate data for 1991-2020 normals
    const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=1991-01-01&end_date=2020-12-31&models=ERA5&monthly=cloud_cover`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.monthly?.cloud_cover) {
      // Average by month across all years
      const monthly = new Array(12).fill(0);
      const counts = new Array(12).fill(0);
      const values: number[] = data.monthly.cloud_cover;
      values.forEach((val: number, idx: number) => {
        const monthIdx = idx % 12;
        monthly[monthIdx] += val;
        counts[monthIdx]++;
      });
      return monthly.map((sum: number, i: number) => counts[i] > 0 ? Math.round(sum / counts[i]) : 50);
    }

    return new Array(12).fill(50); // Default 50% if API fails
  } catch {
    return new Array(12).fill(50);
  }
}
