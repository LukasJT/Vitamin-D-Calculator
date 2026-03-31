/**
 * Solar Position Calculations
 *
 * Computes solar zenith angle and related parameters for any location and time.
 * Uses the SunCalc library which implements algorithms from:
 *
 * CITATIONS:
 * - Meeus, J. (1991). "Astronomical Algorithms." Willmann-Bell, Inc.
 *   ISBN: 0-943396-35-2
 *   Used for: Solar position calculation (declination, hour angle, altitude)
 *
 * - Reda, I. & Andreas, A. (2004). "Solar Position Algorithm for Solar
 *   Radiation Applications." Solar Energy, 76(5), 577-589.
 *   DOI: 10.1016/j.solener.2003.12.003
 *   Used for: Validation of solar position accuracy (~0.0003° precision)
 *
 * - Spencer, J.W. (1971). "Fourier series representation of the position
 *   of the Sun." Search, 2(5), 172.
 *   Used for: Equation of time and solar declination approximations
 */

import SunCalc from 'suncalc';
import type { SolarPosition } from './types';

/**
 * Get solar position for a specific time and location.
 *
 * @param date - Date/time for calculation
 * @param latitude - Degrees north (-90 to 90)
 * @param longitude - Degrees east (-180 to 180)
 * @returns Solar position with altitude and zenith angle in radians
 */
export function getSolarPosition(
  date: Date,
  latitude: number,
  longitude: number
): SolarPosition {
  const pos = SunCalc.getPosition(date, latitude, longitude);
  return {
    altitude: pos.altitude, // radians above horizon
    azimuth: pos.azimuth, // radians
    zenithAngle: Math.PI / 2 - pos.altitude, // radians from vertical
  };
}

/**
 * Get sunrise and sunset times for a date and location.
 */
export function getSunTimes(date: Date, latitude: number, longitude: number) {
  return SunCalc.getTimes(date, latitude, longitude);
}

/**
 * Calculate the daily average solar zenith angle during a specified outdoor period.
 * Samples every 15 minutes within the outdoor window between sunrise and sunset.
 *
 * Uses solar noon as a timezone-independent anchor point. The user's outdoor
 * hours (e.g. 10am-2pm local) are interpreted as offsets from solar noon,
 * since solar noon ≈ 12:00 local solar time at any longitude. This avoids
 * bugs where the system timezone differs from the location's timezone.
 *
 * @param date - The date to calculate for
 * @param latitude - Degrees north
 * @param longitude - Degrees east
 * @param startHour - Start of outdoor time in local solar time (0-24, e.g. 10 for 10am)
 * @param endHour - End of outdoor time in local solar time (0-24, e.g. 14 for 2pm)
 * @returns Object with average zenith angle, min zenith (solar noon), and sample count
 */
export function getDailyOutdoorSolarData(
  date: Date,
  latitude: number,
  longitude: number,
  startHour: number,
  endHour: number
): { avgZenith: number; minZenith: number; samples: number; avgAltitude: number } {
  const times = getSunTimes(date, latitude, longitude);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const solarNoon = times.solarNoon;

  // If no sunrise (polar night) or no solar noon, return max zenith
  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime()) || isNaN(solarNoon.getTime())) {
    return { avgZenith: Math.PI / 2, minZenith: Math.PI / 2, samples: 0, avgAltitude: 0 };
  }

  const MS_PER_HOUR = 3600000;
  const noonMs = solarNoon.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();

  // Convert user's local solar hours to timestamps anchored on solar noon.
  // Solar noon ≈ 12:00 local solar time, so hour 10 = noon - 2h, hour 14 = noon + 2h
  const windowStartMs = noonMs + (startHour - 12) * MS_PER_HOUR;
  const windowEndMs = noonMs + (endHour - 12) * MS_PER_HOUR;

  // Clamp to daylight hours (using timestamps — timezone-safe)
  const effectiveStartMs = Math.max(windowStartMs, sunriseMs);
  const effectiveEndMs = Math.min(windowEndMs, sunsetMs);

  if (effectiveStartMs >= effectiveEndMs) {
    return { avgZenith: Math.PI / 2, minZenith: Math.PI / 2, samples: 0, avgAltitude: 0 };
  }

  let totalZenith = 0;
  let totalAltitude = 0;
  let minZenith = Math.PI;
  let samples = 0;

  // Sample every 15 minutes using millisecond timestamps (timezone-safe)
  const stepMs = 0.25 * MS_PER_HOUR; // 15 minutes
  for (let ms = effectiveStartMs; ms < effectiveEndMs; ms += stepMs) {
    const sampleDate = new Date(ms);
    const pos = getSolarPosition(sampleDate, latitude, longitude);

    if (pos.altitude > 0) {
      totalZenith += pos.zenithAngle;
      totalAltitude += pos.altitude;
      minZenith = Math.min(minZenith, pos.zenithAngle);
      samples++;
    }
  }

  if (samples === 0) {
    return { avgZenith: Math.PI / 2, minZenith: Math.PI / 2, samples: 0, avgAltitude: 0 };
  }

  return {
    avgZenith: totalZenith / samples,
    minZenith,
    samples,
    avgAltitude: totalAltitude / samples,
  };
}

/**
 * Get the peak solar altitude (minimum zenith angle) for a given date and location.
 * This occurs at solar noon.
 */
export function getPeakSolarAltitude(
  date: Date,
  latitude: number,
  longitude: number
): number {
  const times = SunCalc.getTimes(date, latitude, longitude);
  const solarNoon = times.solarNoon;

  if (isNaN(solarNoon.getTime())) return 0;

  const pos = getSolarPosition(solarNoon, latitude, longitude);
  return Math.max(0, pos.altitude);
}
