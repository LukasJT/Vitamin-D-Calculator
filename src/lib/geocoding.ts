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
    const sanitized = query.trim().slice(0, 200);
    if (!sanitized) return null;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitized)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VitaminDCalculator/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon, name: String(data[0].display_name ?? '') };
  } catch {
    return null;
  }
}

/**
 * Reverse geocode: get location name from coordinates.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const fallback = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return fallback;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VitaminDCalculator/1.0' },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return String(data.display_name ?? fallback);
  } catch {
    return fallback;
  }
}

/**
 * Get elevation for coordinates using Open-Meteo Elevation API.
 * Free, no API key required.
 *
 * https://open-meteo.com/en/docs/elevation-api
 */
export async function getElevation(lat: number, lon: number): Promise<number> {
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return 0;
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data = await res.json();
    const elev = Number(data.elevation?.[0] ?? 0);
    return isFinite(elev) ? elev / 1000 : 0;
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
  const defaults = new Array(12).fill(50);
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return defaults;
  try {
    const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=1991-01-01&end_date=2020-12-31&models=ERA5&monthly=cloud_cover`;
    const res = await fetch(url);
    if (!res.ok) return defaults;
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
