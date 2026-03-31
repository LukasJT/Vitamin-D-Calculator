/**
 * Type definitions for the Vitamin D Calculator
 */

/** Fitzpatrick skin phototype classification (I-VI) */
export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

/** User's location data */
export interface LocationData {
  latitude: number;
  longitude: number;
  elevation_km: number;
  name?: string;
}

/** Personal characteristics */
export interface PersonalData {
  skinType: FitzpatrickType;
  ageGroup: AgeGroup;
  weight_kg?: number;
  outdoorMinutes: number;
  outdoorStartHour: number;
  outdoorEndHour: number;
  exposedSkinFraction: number; // 0-1
  spf: number; // 0 = no sunscreen, 15, 30, 50, etc.
  sunscreenCoverage: number; // 0-1, fraction of skin with sunscreen
}

/** Environmental conditions */
export interface EnvironmentData {
  cloudCoverPercent: number; // 0-100
  surfaceType: SurfaceType;
  month: number; // 1-12
}

export type AgeGroup =
  | 'infant' // 0-12 months
  | 'child' // 1-18
  | 'adult' // 19-50
  | 'older_adult' // 51-70
  | 'elderly' // 71+
  | 'pregnant';

export type SurfaceType = 'grass' | 'sand' | 'snow' | 'water' | 'concrete';

/** Full calculator input */
export interface CalculatorInput {
  location: LocationData;
  personal: PersonalData;
  environment: EnvironmentData;
}

/** Calculator results */
export interface CalculatorResult {
  dailySunVitaminD_IU: number;
  recommendedIntake_IU: number;
  supplementNeeded_IU: number;
  peakUVIndex: number;
  effectiveUVIndex: number;
  timeToOneMED_minutes: number;
  safeExposureTime_minutes: number;
  monthlyProduction: MonthlyData[];
}

export interface MonthlyData {
  month: number;
  monthName: string;
  vitaminD_IU: number;
  uvIndex: number;
  supplementNeeded_IU: number;
}

/** Solar position data */
export interface SolarPosition {
  altitude: number; // radians above horizon
  azimuth: number; // radians
  zenithAngle: number; // radians from vertical
}
