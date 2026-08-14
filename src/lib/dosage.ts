/**
 * Vitamin D dosing model — how much cholecalciferol (D3) is needed to
 * raise serum 25-hydroxyvitamin D [25(OH)D] from a current level to a
 * target, and what daily dose then holds it there.
 *
 * Repletion (loading) dose
 * ------------------------
 * The weight-based formula validated by Van Groningen et al. (2010) is:
 *
 *     total dose (IU) = 40 × (target − current, in nmol/L) × body weight (kg)
 *
 * i.e. ~40 IU of cholecalciferol per kg of body weight raises serum
 * 25(OH)D by 1 nmol/L. This was derived in a cohort of 211 deficient
 * outpatients and predicts the loading requirement to reach 75 nmol/L
 * (30 ng/mL) well across a wide BMI range, because the body-weight term
 * already absorbs most of the adipose-dilution effect (Drincic 2012).
 *
 * Maintenance dose
 * ----------------
 * Once repleted, a steady daily intake holds serum 25(OH)D near a plateau.
 * Extended-dosing data (Heaney 2003) give roughly 1 ng/mL of steady-state
 * rise per 100 IU/day in lean adults above an intake-free intercept of
 * ~10 ng/mL. Obesity and fat malabsorption blunt the response, so the
 * requirement scales up ~1.5× for BMI ≥ 30 and ~2× for BMI ≥ 35 or
 * malabsorption (Endocrine Society, Holick 2011).
 *
 * None of this replaces a clinician's judgement — it is an educational
 * estimate anchored to published dose-response data.
 */

/** 1 ng/mL = 2.5 nmol/L. */
export const NGML_PER_NMOLL = 1 / 2.5;

export type MeasurementUnit = 'ng/mL' | 'nmol/L';

export interface DosageInput {
  /** Current serum 25(OH)D, in the chosen unit. */
  current: number;
  /** Target serum 25(OH)D, in the chosen unit. */
  target: number;
  /** Unit the current/target values are expressed in. */
  unit: MeasurementUnit;
  /** Body weight in kilograms. */
  weightKg: number;
  /** Body-mass index (kg/m²) — scales the maintenance requirement. */
  bmi: number;
  /** Known fat malabsorption (coeliac, Crohn's, bariatric surgery,
   *  cystic fibrosis, cholestatic liver disease). Raises the requirement. */
  malabsorption: boolean;
}

export interface LoadingRegimen {
  label: string;
  detail: string;
  weeks: number;
}

export interface DosageResult {
  currentNg: number;
  targetNg: number;
  /** Total repletion dose to close the gap (IU). 0 if already at/above target. */
  totalRepletionIU: number;
  /** Practical loading schedules that deliver ≈ the total repletion dose. */
  loadingRegimens: LoadingRegimen[];
  /** Daily maintenance dose to hold the target once reached (IU/day). */
  maintenanceIU: number;
  /** Multiplier applied to the lean maintenance requirement. */
  maintenanceMultiplier: number;
  /** Plain-language status of the current level. */
  status: 'sufficient' | 'insufficient' | 'deficient' | 'severely_deficient';
  /** Whether the target itself is within the sensible 20–60 ng/mL band. */
  targetWarning: string | null;
  /** Projected serum rise on the maintenance dose alone, 0–180 days. */
  projection: { day: number; ng: number }[];
}

const SEVERE = 12;      // ng/mL
const DEFICIENT = 20;   // ng/mL — IOM
const SUFFICIENT = 30;  // ng/mL — Endocrine Society

function toNg(value: number, unit: MeasurementUnit): number {
  return unit === 'ng/mL' ? value : value * NGML_PER_NMOLL;
}

/** Effective terminal half-life of 25(OH)D used for the rise projection. */
function halfLifeDays(bmi: number): number {
  if (bmi <= 22) return 60;
  if (bmi <= 28) return 70;
  if (bmi <= 35) return 80;
  return 90;
}

export function computeDosage(input: DosageInput): DosageResult {
  const currentNg = Math.max(0, toNg(input.current, input.unit));
  const targetNg = toNg(input.target, input.unit);

  const currentNmol = currentNg / NGML_PER_NMOLL;
  const targetNmol = targetNg / NGML_PER_NMOLL;

  const weight = Math.max(10, input.weightKg);

  // Van Groningen weight-based repletion: 40 IU/kg per nmol/L of deficit.
  const gapNmol = Math.max(0, targetNmol - currentNmol);
  let totalRepletionIU = Math.round((40 * gapNmol * weight) / 1000) * 1000;
  totalRepletionIU = Math.min(600_000, totalRepletionIU);

  // Practical loading schedules that sum to ≈ the total repletion dose.
  const loadingRegimens: LoadingRegimen[] = [];
  if (totalRepletionIU > 0) {
    const weeks50k = Math.max(1, Math.round(totalRepletionIU / 50_000));
    loadingRegimens.push({
      label: `50,000 IU once weekly × ${weeks50k} week${weeks50k > 1 ? 's' : ''}`,
      detail: 'Classic Endocrine Society repletion regimen for deficiency (Holick 2011).',
      weeks: weeks50k,
    });
    const dailyWeeks = 8;
    const dailyLoad = Math.round(totalRepletionIU / (dailyWeeks * 7) / 500) * 500;
    if (dailyLoad >= 1000) {
      loadingRegimens.push({
        label: `${dailyLoad.toLocaleString()} IU daily × ${dailyWeeks} weeks`,
        detail: 'Daily equivalent — steadier levels, better for adherence if you dislike large boluses.',
        weeks: dailyWeeks,
      });
    }
  }

  // Maintenance dose: ~100 IU/day per ng/mL above a ~10 ng/mL intercept,
  // scaled for adiposity / malabsorption.
  let multiplier = 1;
  if (input.malabsorption) multiplier = 2.5;
  else if (input.bmi >= 35) multiplier = 2;
  else if (input.bmi >= 30) multiplier = 1.5;

  const leanMaintenance = Math.max(0, (targetNg - 10)) * 100;
  let maintenanceIU = Math.round((leanMaintenance * multiplier) / 100) * 100;
  maintenanceIU = Math.max(400, Math.min(10_000, maintenanceIU));

  const status: DosageResult['status'] =
    currentNg < SEVERE ? 'severely_deficient' :
    currentNg < DEFICIENT ? 'deficient' :
    currentNg < SUFFICIENT ? 'insufficient' :
    'sufficient';

  let targetWarning: string | null = null;
  if (targetNg > 60) {
    targetWarning = 'Targets above 60 ng/mL are not supported by outcome trials and increase the risk of hypercalcaemia. Most guidelines aim for 30–50 ng/mL.';
  } else if (targetNg < 20) {
    targetWarning = 'A target below 20 ng/mL is at or under the deficiency threshold. Most people should aim for at least 30 ng/mL.';
  } else if (targetNg <= currentNg) {
    targetWarning = 'Your current level already meets this target — no loading dose is required, only maintenance.';
  }

  // Project the rise on the maintenance dose alone (no loading), so the
  // chart shows why a loading dose is worth it when the gap is large.
  const hl = halfLifeDays(input.bmi);
  const lambda = Math.LN2 / hl;
  const steady = currentNg + (maintenanceIU / 100) / multiplier; // asymptotic gain
  const projection: { day: number; ng: number }[] = [];
  for (let d = 0; d <= 180; d += 15) {
    const ng = steady - (steady - currentNg) * Math.exp(-lambda * d);
    projection.push({ day: d, ng: Math.round(ng * 10) / 10 });
  }

  return {
    currentNg: Math.round(currentNg * 10) / 10,
    targetNg: Math.round(targetNg * 10) / 10,
    totalRepletionIU,
    loadingRegimens,
    maintenanceIU,
    maintenanceMultiplier: multiplier,
    status,
    targetWarning,
    projection,
  };
}
