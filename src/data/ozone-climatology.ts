/**
 * Monthly Total Column Ozone Climatology by Latitude Band
 *
 * Values are total column ozone in Dobson Units (DU), representing the
 * monthly zonal mean from 1979-2020 satellite observations.
 *
 * CITATION:
 * - Bodeker, G.E. et al. (2005). "Global ozone climatology." In: Scientific
 *   Assessment of Ozone Depletion: 2006, WMO Global Ozone Research and
 *   Monitoring Project Report No. 50, Chapter 3.
 *
 * - McPeters, R.D. et al. (2015). "Validation of the Aura Ozone Monitoring
 *   Instrument total column ozone product." Journal of Geophysical Research:
 *   Atmospheres, 120(19), 10,514-10,528.
 *   DOI: 10.1002/2015JD023602
 *   Used for: Modern satellite-era ozone climatology validation.
 *
 * - NASA Ozone Watch (https://ozonewatch.gsfc.nasa.gov/)
 *   Used for: Monthly zonal mean total ozone data from TOMS/OMI instruments.
 *
 * Data organized as latitude bands (center of band) × months (1-12).
 * Interpolate between bands for intermediate latitudes.
 */

// Latitude band centers (°N, negative = South)
const LATITUDE_BANDS = [-75, -55, -35, -15, 15, 35, 55, 75];

// Monthly ozone values in DU [latBand][month-1]
// Derived from NASA Ozone Watch zonal mean climatology (1979-2020 average)
const OZONE_DATA: number[][] = [
  // -75°S (Antarctic)
  [295, 285, 275, 265, 250, 240, 245, 260, 220, 260, 300, 305],
  // -55°S
  [310, 300, 295, 290, 290, 295, 300, 310, 300, 310, 320, 315],
  // -35°S
  [280, 275, 275, 280, 285, 290, 290, 285, 280, 275, 275, 278],
  // -15°S (Tropical South)
  [260, 258, 260, 262, 265, 268, 270, 268, 265, 262, 260, 258],
  // +15°N (Tropical North)
  [260, 265, 270, 275, 280, 282, 280, 275, 270, 265, 262, 258],
  // +35°N
  [310, 325, 340, 345, 340, 320, 305, 295, 285, 285, 290, 300],
  // +55°N
  [340, 360, 380, 385, 375, 350, 330, 315, 295, 295, 310, 325],
  // +75°N (Arctic)
  [350, 370, 400, 410, 395, 360, 335, 315, 295, 300, 320, 340],
];

/**
 * Get total column ozone for a latitude and month.
 *
 * Uses linear interpolation between the nearest latitude bands.
 * Clamps to polar values for latitudes beyond ±75°.
 *
 * @param latitude - Degrees north (-90 to 90)
 * @param month - Month number (1-12)
 * @returns Total column ozone in Dobson Units
 */
export function getOzoneColumn(latitude: number, month: number): number {
  const monthIdx = Math.max(0, Math.min(11, month - 1));

  // Clamp latitude to data range
  const lat = Math.max(-75, Math.min(75, latitude));

  // Find the two nearest latitude bands
  let lowerIdx = 0;
  for (let i = 0; i < LATITUDE_BANDS.length - 1; i++) {
    if (lat >= LATITUDE_BANDS[i]) lowerIdx = i;
  }
  const upperIdx = Math.min(lowerIdx + 1, LATITUDE_BANDS.length - 1);

  if (lowerIdx === upperIdx) {
    return OZONE_DATA[lowerIdx][monthIdx];
  }

  // Linear interpolation
  const lowerLat = LATITUDE_BANDS[lowerIdx];
  const upperLat = LATITUDE_BANDS[upperIdx];
  const fraction = (lat - lowerLat) / (upperLat - lowerLat);

  const lowerOzone = OZONE_DATA[lowerIdx][monthIdx];
  const upperOzone = OZONE_DATA[upperIdx][monthIdx];

  return lowerOzone + fraction * (upperOzone - lowerOzone);
}
