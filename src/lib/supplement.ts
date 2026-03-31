/**
 * Vitamin D Supplementation Recommendations
 *
 * Calculates the gap between sun-derived vitamin D and recommended intake,
 * providing a supplementation recommendation.
 *
 * CITATIONS:
 *
 * - Institute of Medicine (IOM). (2011). "Dietary Reference Intakes for
 *   Calcium and Vitamin D." The National Academies Press, Washington, DC.
 *   DOI: 10.17226/13050
 *   Used for: RDA and Tolerable Upper Intake Level (UL) values.
 *   RDA: 600 IU/day (ages 1-70), 800 IU/day (>70 years)
 *   UL: 4000 IU/day for adults
 *
 * - Holick, M.F. et al. (2011). "Evaluation, Treatment, and Prevention of
 *   Vitamin D Deficiency: an Endocrine Society Clinical Practice Guideline."
 *   Journal of Clinical Endocrinology & Metabolism, 96(7), 1911-1930.
 *   DOI: 10.1210/jc.2011-0385
 *   PMID: 21646368
 *   Used for: Higher recommended intakes for at-risk populations.
 *   Suggests 1500-2000 IU/day for adults to maintain 25(OH)D >30 ng/mL.
 *
 * - Demay, M.B. et al. (2024). "Vitamin D for the Prevention of Disease:
 *   An Endocrine Society Clinical Practice Guideline." Journal of Clinical
 *   Endocrinology & Metabolism, 109(8), 1907-1947.
 *   DOI: 10.1210/clinem/dgae290
 *   PMID: 38828931
 *   Used for: Updated 2024 guidelines with condition-specific recommendations.
 *   Notable: 1000-2000 IU/day for prediabetes (diabetes prevention),
 *   higher doses for specific conditions.
 *
 * - Wagner, C.L. & Greer, F.R. (2008). "Prevention of Rickets and Vitamin D
 *   Deficiency in Infants, Children, and Adolescents." Pediatrics, 122(5),
 *   1142-1152.
 *   DOI: 10.1542/peds.2008-1862
 *   PMID: 18977996
 *   Used for: Pediatric vitamin D recommendations (400 IU/day for infants).
 *
 * - EFSA Panel on Dietetic Products. (2016). "Dietary reference values for
 *   vitamin D." EFSA Journal, 14(10), e04547.
 *   DOI: 10.2903/j.efsa.2016.4547
 *   Used for: European perspective on adequate intake (600 IU/day for all ages >1y).
 *
 * - Pludowski, P. et al. (2018). "Vitamin D supplementation guidelines."
 *   Journal of Steroid Biochemistry and Molecular Biology, 175, 125-135.
 *   DOI: 10.1016/j.jsbmb.2017.01.021
 *   PMID: 28216084
 *   Used for: Central European consensus on vitamin D supplementation by age
 *   and risk category.
 */

import type { AgeGroup } from './types';

/**
 * Recommended Daily Allowance (RDA) for vitamin D by age group.
 *
 * Based on IOM (2011) RDA values as the baseline, with higher ranges
 * from the Endocrine Society (2011, 2024) for optimal health.
 *
 * We provide a range: minimum (IOM RDA) and optimal (Endocrine Society).
 */
export interface RecommendationRange {
  minimum_IU: number; // IOM RDA — prevents deficiency
  optimal_IU: number; // Endocrine Society — targets 25(OH)D ≥30 ng/mL
  upperLimit_IU: number; // IOM Tolerable Upper Intake Level
  source: string;
}

export function getRecommendedIntake(ageGroup: AgeGroup): RecommendationRange {
  const recommendations: Record<AgeGroup, RecommendationRange> = {
    infant: {
      // Wagner & Greer (2008): 400 IU/day from birth
      // IOM (2011): 400 IU/day, UL = 1000-1500 IU/day
      minimum_IU: 400,
      optimal_IU: 400,
      upperLimit_IU: 1000,
      source: 'Wagner & Greer (2008); IOM (2011)',
    },
    child: {
      // IOM (2011): 600 IU/day RDA for ages 1-18
      // Endocrine Society (2011): 600-1000 IU/day
      minimum_IU: 600,
      optimal_IU: 1000,
      upperLimit_IU: 4000,
      source: 'IOM (2011); Endocrine Society (2011)',
    },
    adult: {
      // IOM (2011): 600 IU/day RDA for ages 19-50
      // Endocrine Society (2011): 1500-2000 IU/day for optimal serum levels
      minimum_IU: 600,
      optimal_IU: 2000,
      upperLimit_IU: 4000,
      source: 'IOM (2011); Holick et al. (2011)',
    },
    older_adult: {
      // IOM (2011): 600 IU/day RDA for ages 51-70
      // Endocrine Society (2011): 1500-2000 IU/day
      minimum_IU: 600,
      optimal_IU: 2000,
      upperLimit_IU: 4000,
      source: 'IOM (2011); Holick et al. (2011)',
    },
    elderly: {
      // IOM (2011): 800 IU/day RDA for ages 71+
      // Endocrine Society (2011): 1500-2000 IU/day
      // Demay et al. (2024): supports higher intakes for fall/fracture prevention
      minimum_IU: 800,
      optimal_IU: 2000,
      upperLimit_IU: 4000,
      source: 'IOM (2011); Demay et al. (2024)',
    },
    pregnant: {
      // IOM (2011): 600 IU/day
      // Endocrine Society (2011): 1500-2000 IU/day during pregnancy
      // Demay et al. (2024): 1000-2000 IU/day for pre-eclampsia reduction
      minimum_IU: 600,
      optimal_IU: 2000,
      upperLimit_IU: 4000,
      source: 'IOM (2011); Demay et al. (2024)',
    },
  };

  return recommendations[ageGroup];
}

/**
 * Calculate the supplementation gap.
 *
 * Compares daily vitamin D from sun exposure against the recommended intake
 * and returns how much supplementation is needed.
 *
 * Also accounts for dietary vitamin D intake (average US diet provides
 * ~200 IU/day from fortified foods — IOM, 2011).
 *
 * @param dailySunProduction_IU - Estimated daily vitamin D from sun exposure
 * @param ageGroup - User's age group for recommendation lookup
 * @param dietaryIntake_IU - Optional dietary vitamin D intake (default: 200 IU)
 * @returns Supplementation recommendation
 */
export function calculateSupplementGap(
  dailySunProduction_IU: number,
  ageGroup: AgeGroup,
  dietaryIntake_IU: number = 200
): {
  recommendation: RecommendationRange;
  totalFromSunAndDiet_IU: number;
  supplementNeeded_minimum_IU: number;
  supplementNeeded_optimal_IU: number;
} {
  const rec = getRecommendedIntake(ageGroup);
  const totalFromSunAndDiet = dailySunProduction_IU + dietaryIntake_IU;

  return {
    recommendation: rec,
    totalFromSunAndDiet_IU: Math.round(totalFromSunAndDiet),
    supplementNeeded_minimum_IU: Math.max(0, Math.round(rec.minimum_IU - totalFromSunAndDiet)),
    supplementNeeded_optimal_IU: Math.max(0, Math.round(rec.optimal_IU - totalFromSunAndDiet)),
  };
}
