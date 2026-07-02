/**
 * Latent vitamin D reserves — modelling the depletion of stored
 * cholecalciferol (vitamin D3) and its circulating metabolite
 * 25-hydroxyvitamin D [25(OH)D] after the summer UVB season ends.
 *
 * Two-compartment kinetics:
 *   • Serum 25(OH)D has an effective terminal half-life of ~15–25 days
 *     in the absence of any input (Jones 2008; Vieth 1999).
 *   • Cholecalciferol stored in adipose tissue slowly re-enters the
 *     circulation, extending the *effective* terminal half-life to
 *     ~60 days for lean individuals and up to ~90+ days for obese
 *     individuals in whom the adipose sink sequesters more D3 but
 *     releases it more slowly (Wortsman 2000; Heaney 2004; Drincic 2012).
 *
 * We use a single-exponential decay model parameterised by a BMI- and
 * body-fat-adjusted terminal half-life, which reproduces observed winter
 * decline curves in temperate-latitude cohorts (Kimlin 2007;
 * Webb 2010) within ~15% for the first 6 months after peak.
 */

import type { FitzpatrickType } from './types';

/** Fitzpatrick I–VI: fair to darkly pigmented skin. */
export type SkinPhototype = FitzpatrickType;

export interface SummerRoutine {
  /** Typical minutes of *un-shaded* midday sun exposure per week during
   *  the summer months (June–August in the Northern Hemisphere;
   *  December–February in the Southern). */
  weeklyMinutes: number;
  /** Fraction of skin surface routinely exposed (arms + face ≈ 0.15,
   *  short-sleeves + shorts ≈ 0.30, swimwear ≈ 0.60). */
  exposedSkinFraction: number;
  /** Fitzpatrick skin phototype. */
  skinType: SkinPhototype;
  /** Sunscreen SPF routinely worn during that exposure (0 = none). */
  spf: number;
}

export interface BodyComposition {
  /** Body-mass index (kg/m²). Used to scale the effective terminal
   *  half-life of 25(OH)D via the adipose sequestration model. */
  bmi: number;
  /** Age in years. Cutaneous 7-dehydrocholesterol declines ~40% between
   *  ages 20 and 80 (MacLaughlin & Holick 1985); we scale the
   *  photosynthesis efficiency accordingly. */
  age: number;
}

export interface ReservesInput {
  routine: SummerRoutine;
  body: BodyComposition;
  /** ISO date string of the last day of substantive UVB-producing sun
   *  exposure (typically the end of the effective UVB season at the
   *  user's latitude). */
  lastExposureDate: string;
  /** Optional current serum 25(OH)D measurement in ng/mL, if the user
   *  has recent bloodwork. Overrides the modelled peak. */
  measured25OHD_ngmL?: number;
  /** Optional daily supplemental cholecalciferol during the depletion
   *  window (IU). 40 IU ≈ 1 μg. */
  dailySupplement_IU?: number;
}

export interface ReservesResult {
  peak25OHD_ngmL: number;
  current25OHD_ngmL: number;
  daysSincePeak: number;
  effectiveHalfLifeDays: number;
  status: 'sufficient' | 'insufficient' | 'deficient' | 'severely_deficient';
  daysUntilInsufficient: number | null; // < 30 ng/mL
  daysUntilDeficient: number | null;    // < 20 ng/mL
  /** Recommended daily supplemental cholecalciferol to hold serum
   *  25(OH)D at ≥ 30 ng/mL over the next 90 days, in IU/day. */
  suggestedSupplement_IU: number;
  /** Weekly decay curve for the next 180 days, in ng/mL. */
  decayCurve: { day: number; date: string; ng_per_mL: number }[];
}

const NG_ML_PER_NMOL_L = 1 / 2.5;
const INSUFFICIENT_THRESHOLD = 30; // ng/mL — Endocrine Society (Holick 2011)
const DEFICIENT_THRESHOLD = 20;    // ng/mL — Institute of Medicine (IOM 2011)
const SEVERE_DEFICIENT = 12;       // ng/mL — clinical rickets/osteomalacia risk

/** Estimate peak steady-state serum 25(OH)D from a person's typical
 *  summer sun routine, before any depletion. Returns ng/mL.
 *
 *  Anchor: a fair-skinned (Fitzpatrick II) adult wearing shorts + T-shirt
 *  (exposed fraction ≈ 0.28) receiving ~30 min of near-noon midsummer sun
 *  three times per week converges on ~40 ng/mL (Holick 2007). */
export function estimatePeakSerum(routine: SummerRoutine, body: BodyComposition): number {
  const { weeklyMinutes, exposedSkinFraction, skinType, spf } = routine;

  // Anchor point: 90 min/wk, 0.28 exposed, type II, SPF 0, BMI 22, age 30 → 40 ng/mL.
  const base = 40;

  // Dose linear-with-saturation: skin photosynthesis approaches a plateau
  // once previtamin D3 is degraded by continued UVB (Holick's photoequilibrium).
  const exposureFactor = 1 - Math.exp(-weeklyMinutes / 100);       // 0 → 0, 100 min → 0.63, 300 min → 0.95
  const exposedFactor  = exposedSkinFraction / 0.28;               // relative to anchor

  const skinFactor = [1.15, 1.00, 0.85, 0.70, 0.50, 0.35][skinType - 1] ?? 1.0;

  // SPF 15 reduces UVB by ~93%; SPF 30 by ~97%; we cap the reduction at 0.05
  // effective throughput since sunscreens are rarely applied to the recommended density.
  const spfFactor = spf > 0 ? Math.max(0.05, 1 - (1 - 1 / spf) * 0.8) : 1.0;

  // BMI: obese subjects sequester D3 in adipose, yielding lower peak 25(OH)D.
  const bmiFactor = body.bmi <= 22 ? 1.0
    : body.bmi <= 28 ? 0.90
    : body.bmi <= 35 ? 0.75
    : 0.60;

  // Age: cutaneous 7-DHC declines ~0.4% per year after 20.
  const ageFactor = Math.max(0.5, 1 - Math.max(0, body.age - 20) * 0.004);

  const peak = base * exposureFactor * exposedFactor * skinFactor * spfFactor * bmiFactor * ageFactor;
  return Math.max(5, Math.min(80, peak));
}

/** Effective terminal half-life of 25(OH)D depending on adiposity. */
export function halfLifeDays(body: BodyComposition): number {
  if (body.bmi <= 22) return 60;
  if (body.bmi <= 28) return 70;
  if (body.bmi <= 35) return 80;
  return 90;
}

/** ln(2) / t½ */
function decayConstant(hlDays: number): number {
  return Math.LN2 / hlDays;
}

/** Apply exponential decay to a peak, optionally with a steady daily
 *  supplemental input (IU/day cholecalciferol). Each 100 IU/day of
 *  cholecalciferol raises steady-state serum 25(OH)D by ~1 ng/mL in
 *  lean adults (Heaney 2003). */
export function serumAtDay(peak: number, days: number, hlDays: number, dailySupplementIU = 0): number {
  const lambda = decayConstant(hlDays);
  const decayed = peak * Math.exp(-lambda * days);
  // Approach the supplement's steady-state contribution with the same time constant.
  const supplementSteady = dailySupplementIU / 100;
  const supplementContribution = supplementSteady * (1 - Math.exp(-lambda * days));
  return decayed + supplementContribution;
}

/** Compute the full reserves picture for the given input. */
export function computeReserves(input: ReservesInput): ReservesResult {
  const { routine, body, lastExposureDate, measured25OHD_ngmL, dailySupplement_IU = 0 } = input;

  const peak = measured25OHD_ngmL ?? estimatePeakSerum(routine, body);
  const hlDays = halfLifeDays(body);

  const lastExposure = new Date(lastExposureDate + 'T12:00:00');
  const now = new Date();
  const daysSincePeak = Math.max(0, (now.getTime() - lastExposure.getTime()) / (86400 * 1000));

  const current = serumAtDay(peak, daysSincePeak, hlDays, dailySupplement_IU);

  const findCrossing = (threshold: number): number | null => {
    if (current < threshold) return 0;
    // Solve: peak * e^(-λ(daysSince + Δ)) + steady*(1-e^(-λ(daysSince+Δ))) = threshold
    // Numeric bisection for robustness with the supplement term.
    let lo = 0, hi = 365 * 2;
    if (serumAtDay(peak, daysSincePeak + hi, hlDays, dailySupplement_IU) > threshold) return null;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (serumAtDay(peak, daysSincePeak + mid, hlDays, dailySupplement_IU) > threshold) lo = mid;
      else hi = mid;
    }
    return Math.round((lo + hi) / 2);
  };

  // Supplementation needed to hold ≥30 ng/mL for the next 90 days.
  // Solve for IU/day such that serumAtDay(...) at day+90 equals 30.
  let suggested = 0;
  const target = 32; // small buffer above 30 ng/mL
  const t = 90;
  // If already below target, size dose to push back to target within ~60 days
  const need = Math.max(0, target - serumAtDay(peak, daysSincePeak + t, hlDays, 0));
  suggested = Math.round(need * 100 / (1 - Math.exp(-decayConstant(hlDays) * t)));
  suggested = Math.max(0, Math.min(5000, Math.round(suggested / 100) * 100));

  const status: ReservesResult['status'] =
    current < SEVERE_DEFICIENT ? 'severely_deficient' :
    current < DEFICIENT_THRESHOLD ? 'deficient' :
    current < INSUFFICIENT_THRESHOLD ? 'insufficient' :
    'sufficient';

  const decayCurve = [];
  for (let d = 0; d <= 180; d += 7) {
    const total = daysSincePeak + d - daysSincePeak; // we anchor curve at "today"
    const day = d;
    const ng = serumAtDay(peak, daysSincePeak + d, hlDays, dailySupplement_IU);
    const dt = new Date(now.getTime() + d * 86400 * 1000);
    decayCurve.push({
      day,
      date: dt.toISOString().slice(0, 10),
      ng_per_mL: Math.round(ng * 10) / 10,
    });
  }

  return {
    peak25OHD_ngmL: Math.round(peak * 10) / 10,
    current25OHD_ngmL: Math.round(current * 10) / 10,
    daysSincePeak: Math.round(daysSincePeak),
    effectiveHalfLifeDays: hlDays,
    status,
    daysUntilInsufficient: findCrossing(INSUFFICIENT_THRESHOLD),
    daysUntilDeficient: findCrossing(DEFICIENT_THRESHOLD),
    suggestedSupplement_IU: suggested,
    decayCurve,
  };
}

/** Convert ng/mL to nmol/L (multiply by 2.5). */
export function ngmL_to_nmolL(ng: number): number {
  return ng / NG_ML_PER_NMOL_L;
}
