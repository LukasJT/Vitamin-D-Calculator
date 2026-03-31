/**
 * Main Calculator Orchestrator
 *
 * Wires together all sub-modules to produce the final vitamin D
 * supplementation recommendation from user inputs.
 */

import { getDailyOutdoorSolarData, getPeakSolarAltitude } from './solar';
import { calculateEffectiveUVI, clearSkyUVIndex, applyElevationCorrection, applyCloudCover, applyAlbedoEnhancement } from './uv-index';
import { calculateVitaminDProduction, safeExposureTime, timeToOneMED } from './vitamin-d';
import { calculateSupplementGap } from './supplement';
import { getOzoneColumn } from '../data/ozone-climatology';
import type { CalculatorInput, CalculatorResult, MonthlyData } from './types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Run the full vitamin D calculation pipeline.
 */
export function calculate(input: CalculatorInput): CalculatorResult {
  const { location, personal, environment } = input;

  // Get ozone for this location and month
  const ozone = getOzoneColumn(location.latitude, environment.month);

  // Build a representative date for the selected month (15th of month, current year)
  const year = new Date().getFullYear();
  const representativeDate = new Date(year, environment.month - 1, 15);

  // Get solar data during outdoor period
  const solarData = getDailyOutdoorSolarData(
    representativeDate,
    location.latitude,
    location.longitude,
    personal.outdoorStartHour,
    personal.outdoorEndHour
  );

  // Peak UV (solar noon)
  const peakAltitude = getPeakSolarAltitude(representativeDate, location.latitude, location.longitude);
  const peakZenith = Math.PI / 2 - peakAltitude;
  const peakUVResult = calculateEffectiveUVI({
    solarZenithAngle: peakZenith,
    ozoneColumn_DU: ozone,
    elevation_km: location.elevation_km,
    cloudCoverPercent: environment.cloudCoverPercent,
    surfaceType: environment.surfaceType,
    spf: 0, // Peak UV shown without sunscreen
    sunscreenCoverage: 0,
  });

  // Average UV during outdoor period (with all adjustments including sunscreen)
  const avgUVResult = calculateEffectiveUVI({
    solarZenithAngle: solarData.avgZenith,
    ozoneColumn_DU: ozone,
    elevation_km: location.elevation_km,
    cloudCoverPercent: environment.cloudCoverPercent,
    surfaceType: environment.surfaceType,
    spf: personal.spf,
    sunscreenCoverage: personal.sunscreenCoverage,
  });

  // Vitamin D production
  const dailyVitD = calculateVitaminDProduction({
    uvIndex: avgUVResult.effective,
    durationMinutes: personal.outdoorMinutes,
    skinType: personal.skinType,
    ageGroup: personal.ageGroup,
    exposedSkinFraction: personal.exposedSkinFraction,
    solarZenithAngle: solarData.avgZenith,
    ozoneColumn_DU: ozone,
  });

  // Time to 1 MED (without sunscreen, for informational purposes)
  const medTime = timeToOneMED(peakUVResult.adjusted, personal.skinType);
  const safeTime = safeExposureTime(peakUVResult.adjusted, personal.skinType);

  // Supplement gap
  const supplement = calculateSupplementGap(dailyVitD, personal.ageGroup);

  // Monthly breakdown
  const monthlyProduction = calculateMonthlyBreakdown(input);

  return {
    dailySunVitaminD_IU: dailyVitD,
    recommendedIntake_IU: supplement.recommendation.optimal_IU,
    supplementNeeded_IU: supplement.supplementNeeded_optimal_IU,
    peakUVIndex: Math.round(peakUVResult.adjusted * 10) / 10,
    effectiveUVIndex: Math.round(avgUVResult.effective * 10) / 10,
    timeToOneMED_minutes: Math.round(medTime),
    safeExposureTime_minutes: Math.round(safeTime),
    monthlyProduction,
  };
}

/**
 * Calculate vitamin D production for all 12 months.
 */
function calculateMonthlyBreakdown(input: CalculatorInput): MonthlyData[] {
  const { location, personal, environment } = input;
  const year = new Date().getFullYear();

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const date = new Date(year, i, 15);
    const ozone = getOzoneColumn(location.latitude, month);

    const solarData = getDailyOutdoorSolarData(
      date,
      location.latitude,
      location.longitude,
      personal.outdoorStartHour,
      personal.outdoorEndHour
    );

    const uvResult = calculateEffectiveUVI({
      solarZenithAngle: solarData.avgZenith,
      ozoneColumn_DU: ozone,
      elevation_km: location.elevation_km,
      cloudCoverPercent: environment.cloudCoverPercent, // Could be per-month if we have data
      surfaceType: environment.surfaceType,
      spf: personal.spf,
      sunscreenCoverage: personal.sunscreenCoverage,
    });

    const vitD = calculateVitaminDProduction({
      uvIndex: uvResult.effective,
      durationMinutes: personal.outdoorMinutes,
      skinType: personal.skinType,
      ageGroup: personal.ageGroup,
      exposedSkinFraction: personal.exposedSkinFraction,
      solarZenithAngle: solarData.avgZenith,
      ozoneColumn_DU: ozone,
    });

    // Peak UV for the month (noon, no sunscreen)
    const peakAlt = getPeakSolarAltitude(date, location.latitude, location.longitude);
    const peakZen = Math.PI / 2 - peakAlt;
    let peakUV = clearSkyUVIndex(peakZen, ozone);
    peakUV = applyElevationCorrection(peakUV, location.elevation_km);
    peakUV = applyCloudCover(peakUV, environment.cloudCoverPercent);
    peakUV = applyAlbedoEnhancement(peakUV, environment.surfaceType);

    const gap = calculateSupplementGap(vitD, personal.ageGroup);

    return {
      month,
      monthName: MONTH_NAMES[i],
      vitaminD_IU: vitD,
      uvIndex: Math.round(peakUV * 10) / 10,
      supplementNeeded_IU: gap.supplementNeeded_optimal_IU,
    };
  });
}
