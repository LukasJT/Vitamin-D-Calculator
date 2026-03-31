/**
 * Vitamin D Synthesis Model
 *
 * Estimates cutaneous vitamin D3 production from UV exposure based on
 * skin type, body surface area exposed, UV dose, and photobiological
 * saturation kinetics.
 *
 * CITATIONS:
 *
 * - Holick, M.F. (2007). "Vitamin D Deficiency." New England Journal of
 *   Medicine, 357(3), 266-281.
 *   DOI: 10.1056/NEJMra070553
 *   PMID: 17634462
 *   Used for: Foundational rule that exposure of ~1/4 body surface to ~1/4 MED
 *   produces ~1000 IU vitamin D3 (equivalent to oral supplementation).
 *   "Exposure of arms and legs for 5-30 min between 10am and 3pm twice per week
 *   is often adequate."
 *
 * - Holick, M.F. et al. (1981). "Photosynthesis of previtamin D3 in human
 *   skin and the physiologic consequences." Science, 210(4466), 203-205.
 *   DOI: 10.1126/science.6251551
 *   PMID: 6251551
 *   Used for: Discovery that previtamin D3 synthesis in skin follows
 *   first-order photochemical kinetics with photoequilibrium saturation.
 *
 * - Webb, A.R. & Holick, M.F. (1988). "Influence of season and latitude on
 *   the cutaneous synthesis of vitamin D3." Journal of Clinical Endocrinology
 *   & Metabolism, 67(2), 373-378.
 *   DOI: 10.1210/jcem-67-2-373
 *   PMID: 2839537
 *   Used for: Demonstration that at latitudes >~37°N, UVB is insufficient
 *   for vitamin D synthesis during winter months. Provides seasonal data
 *   for Boston (42°N) and Edmonton (52°N).
 *
 * - Clemens, T.L. et al. (1982). "Increased skin pigment reduces the capacity
 *   of skin to synthesise vitamin D3." The Lancet, 319(8263), 74-76.
 *   DOI: 10.1016/S0140-6736(82)90214-7
 *   PMID: 6119494
 *   Used for: Melanin's attenuation of UVB photons reaching the dermal
 *   7-dehydrocholesterol layer. Darker skin requires 5-10× more exposure.
 *
 * - Fitzpatrick, T.B. (1988). "The validity and practicality of sun-reactive
 *   skin types I through VI." Archives of Dermatology, 124(6), 869-871.
 *   DOI: 10.1001/archderm.1988.01670060015008
 *   PMID: 3377516
 *   Used for: Fitzpatrick skin type classification system defining MED values.
 *
 * - Terushkin, V. et al. (2010). "Estimated equivalency of vitamin D
 *   production from natural sun exposure versus oral vitamin D supplementation
 *   across seasons at two US latitudes." Journal of the American Academy of
 *   Dermatology, 62(6), 929.e1-929.e9.
 *   DOI: 10.1016/j.jaad.2009.07.028
 *   PMID: 20398766
 *   Used for: Quantitative vitamin D production rates by skin type, season,
 *   latitude (Boston 42°N, Miami 26°N), and body surface area exposed.
 *   Key data: Type II skin, 25% BSA exposed at solar noon in July at 42°N
 *   produces ~1000 IU in ~3-5 minutes.
 *
 * - Sayre, R.M. et al. (2007). "Vitamin D production by natural and artificial
 *   sources." Photochemistry and Photobiology, 83, 1-8.
 *   Used for: Correction factor (1.32×) between fluorescent lamp standards
 *   and natural sunlight for vitamin D synthesis efficiency.
 *
 * - MacLaughlin, J.A. & Holick, M.F. (1985). "Aging decreases the capacity
 *   of human skin to produce vitamin D3." Journal of Clinical Investigation,
 *   76(4), 1536-1538.
 *   DOI: 10.1172/JCI112134
 *   PMID: 2997282
 *   Used for: Age-related decline in cutaneous vitamin D production.
 *   A 70-year-old produces ~25% of the vitamin D3 that a 20-year-old does.
 *
 * - Bogh, M.K.B. et al. (2010). "Vitamin D production after UVB exposure
 *   depends on baseline vitamin D and total cholesterol but not on skin
 *   pigmentation." Journal of Investigative Dermatology, 130(2), 546-553.
 *   DOI: 10.1038/jid.2009.323
 *   PMID: 19812601
 *   Used for: Confirming photoequilibrium limits and baseline dependency.
 */

/**
 * ADDITIONAL CITATIONS for spectral efficiency model:
 *
 * - MacLaughlin, J.A., Anderson, R.R. & Holick, M.F. (1982). "Spectral
 *   character of sunlight modulates photosynthesis of previtamin D3 and its
 *   photoisomers in human skin." Science, 216(4549), 1001-1003.
 *   DOI: 10.1126/science.6281884
 *   PMID: 6281884
 *   Used for: The action spectrum for previtamin D3 peaks sharply at 295-300nm
 *   and is confined to 290-315nm UVB. This is narrower than the erythemal
 *   action spectrum which extends into UVA.
 *
 * - McKenzie, R.L., Liley, J.B. & Björn, L.O. (2009). "UV Radiation:
 *   Balancing Risks and Benefits." Photochemistry and Photobiology, 85, 88-98.
 *   DOI: 10.1111/j.1751-1097.2008.00400.x
 *   Used for: "The ratio of vitamin D-effective UV to erythemally-effective UV
 *   decreases with increasing SZA, typically by a factor of 5 or more between
 *   SZA of 20° and SZA of 70°."
 *
 * - Engelsen, O. (2010). "The Relationship between Ultraviolet Radiation
 *   Exposure and Vitamin D Status." Nutrients, 2(5), 482-495.
 *   DOI: 10.3390/nu2050482
 *   Used for: Quantifying the "vitamin D winter" — periods where SZA is too
 *   large for meaningful previtamin D3 synthesis regardless of exposure time.
 */

import type { FitzpatrickType, AgeGroup } from './types';

/**
 * Minimal Erythemal Dose (MED) by Fitzpatrick skin type.
 *
 * One MED is the UV dose that produces just-perceptible reddening (erythema)
 * of unacclimatized skin 24 hours after exposure.
 *
 * Values from Fitzpatrick (1988) and the CIE (International Commission on
 * Illumination) standard ranges. We use midpoint values in J/m².
 *
 * Note: 1 MED = varies by skin type. 1 Standard Erythemal Dose (SED) = 100 J/m²
 * of CIE-weighted erythemal UV.
 */
export const MED_VALUES: Record<FitzpatrickType, { med_Jm2: number; description: string }> = {
  1: { med_Jm2: 200, description: 'Type I: Very fair, always burns, never tans' },
  2: { med_Jm2: 250, description: 'Type II: Fair, burns easily, tans minimally' },
  3: { med_Jm2: 350, description: 'Type III: Medium, burns moderately, tans gradually' },
  4: { med_Jm2: 450, description: 'Type IV: Olive, burns minimally, tans well' },
  5: { med_Jm2: 600, description: 'Type V: Brown, rarely burns, tans profusely' },
  6: { med_Jm2: 1000, description: 'Type VI: Dark brown/black, never burns' },
};

/**
 * Calculate time to reach one MED for a given skin type and UV conditions.
 *
 * By WHO definition, 1 UV Index = 25 mW/m² of CIE-weighted erythemal irradiance.
 *
 * Time to 1 MED (seconds) = MED (J/m²) / Irradiance (W/m²)
 *                         = MED (J/m²) / (UVI × 0.025 W/m²)
 *
 * @param uvIndex - Effective UV Index
 * @param skinType - Fitzpatrick skin type (1-6)
 * @returns Time to 1 MED in minutes
 */
export function timeToOneMED(uvIndex: number, skinType: FitzpatrickType): number {
  if (uvIndex <= 0) return Infinity;

  const med = MED_VALUES[skinType].med_Jm2;
  const irradiance_Wm2 = uvIndex * 0.025; // WHO definition: 1 UVI = 25 mW/m²
  const timeSeconds = med / irradiance_Wm2;
  return timeSeconds / 60; // convert to minutes
}

/**
 * Calculate cumulative UV dose over a time period.
 *
 * @param uvIndex - Average effective UV Index during exposure
 * @param durationMinutes - Exposure duration in minutes
 * @returns Cumulative erythemal UV dose in J/m²
 */
export function cumulativeUVDose(uvIndex: number, durationMinutes: number): number {
  const irradiance_Wm2 = uvIndex * 0.025; // 1 UVI = 25 mW/m²
  const durationSeconds = durationMinutes * 60;
  return irradiance_Wm2 * durationSeconds; // J/m²
}

/**
 * Melanin attenuation factor by skin type.
 *
 * Melanin absorbs UVB photons before they can reach the 7-dehydrocholesterol
 * in the stratum basale and stratum spinosum. Clemens et al. (1982) showed
 * that heavily pigmented skin (Type VI) requires 5-10× the exposure of
 * Type I/II skin to produce equivalent previtamin D3.
 *
 * These factors represent relative vitamin D synthesis efficiency compared
 * to Type I skin, derived from Clemens et al. (1982) and Terushkin et al. (2010).
 *
 * @param skinType - Fitzpatrick skin type (1-6)
 * @returns Relative synthesis efficiency (0-1, where 1 = Type I)
 */
export function melaninAttenuationFactor(skinType: FitzpatrickType): number {
  const factors: Record<FitzpatrickType, number> = {
    1: 1.0,    // Reference (no melanin attenuation)
    2: 0.85,   // ~15% reduction
    3: 0.65,   // ~35% reduction
    4: 0.50,   // ~50% reduction (Terushkin et al., 2010)
    5: 0.25,   // ~75% reduction (Clemens et al., 1982)
    6: 0.125,  // ~87.5% reduction, ~8× more exposure needed
  };
  return factors[skinType];
}

/**
 * Age-related vitamin D synthesis capacity.
 *
 * MacLaughlin & Holick (1985) demonstrated that aging skin has reduced
 * 7-dehydrocholesterol concentrations in the epidermis:
 * - Age 20: baseline (factor = 1.0)
 * - Age 70: approximately 25% of young adult capacity (factor = 0.25)
 *
 * We model this as a linear decline from age 20 to 80, using midpoint
 * values for each age group.
 *
 * @param ageGroup - User's age group
 * @returns Age correction factor (0-1)
 */
export function ageSynthesisFactor(ageGroup: AgeGroup): number {
  const factors: Record<AgeGroup, number> = {
    infant: 1.0,       // Infants have high capacity but should avoid direct sun
    child: 1.0,        // Full synthesis capacity
    adult: 0.90,       // Midpoint ~35 years: slight decline
    older_adult: 0.65, // Midpoint ~60 years: significant decline
    elderly: 0.40,     // Midpoint ~75 years: major decline (MacLaughlin & Holick, 1985)
    pregnant: 0.90,    // Same as adult; pregnancy doesn't change skin synthesis
  };
  return factors[ageGroup];
}

/**
 * Atmospheric air mass factor using Kasten & Young (1989) formula.
 *
 * CITATION:
 * - Kasten, F. & Young, A.T. (1989). "Revised optical air mass tables and
 *   approximation formula." Applied Optics, 28(22), 4735-4738.
 *   DOI: 10.1364/AO.28.004735
 *
 * Accounts for Earth's curvature at high SZA where 1/cos(SZA) diverges.
 *
 * @param szaRadians - Solar zenith angle in radians
 * @returns Relative air mass (dimensionless, 1.0 at zenith)
 */
function airMassFactor(szaRadians: number): number {
  const szaDeg = szaRadians * (180 / Math.PI);
  if (szaDeg >= 90) return 40; // Horizon limit
  const cosSZA = Math.cos(szaRadians);
  return 1 / (cosSZA + 0.50572 * Math.pow(96.07995 - szaDeg, -1.6364));
}

/**
 * Vitamin D spectral efficiency using a 2-wavelength Beer-Lambert model.
 *
 * Instead of an arbitrary sigmoid, this computes the ACTUAL atmospheric
 * transmission of vitamin D-effective UVB wavelengths using ozone absorption
 * cross-sections and Rayleigh scattering optical depths.
 *
 * PHYSICS:
 * The previtamin D3 action spectrum (MacLaughlin et al., 1982) peaks sharply
 * at 295-300nm and drops to ~12% at 305nm and ~1% at 310nm. We model this
 * using two representative wavelength bands:
 *
 *   λ₁ = 297nm (peak action): weight = 0.7
 *     σ_ozone = 4.0 × 10⁻¹⁹ cm²/molecule (Molina & Molina, 1986)
 *     τ_Rayleigh = 1.11 (at zenith, Bodhaine et al., 1999)
 *
 *   λ₂ = 303nm (secondary): weight = 0.3
 *     σ_ozone = 1.2 × 10⁻¹⁹ cm²/molecule
 *     τ_Rayleigh = 1.03
 *
 * ADDITIONAL CITATIONS:
 * - Molina, L.T. & Molina, M.J. (1986). "Absolute absorption cross sections
 *   of ozone in the 185- to 350-nm wavelength range." Journal of Geophysical
 *   Research, 91(D13), 14501-14508.
 *   DOI: 10.1029/JD091iD13p14501
 *   Used for: Ozone absorption cross-sections at 297nm and 303nm.
 *
 * - Bodhaine, B.A. et al. (1999). "On Rayleigh Optical Depth Calculations."
 *   Journal of Atmospheric and Oceanic Technology, 16(11), 1854-1861.
 *   DOI: 10.1175/1520-0426(1999)016<1854:ORODC>2.0.CO;2
 *   Used for: Rayleigh scattering optical depths at UV wavelengths.
 *
 * VALIDATION against Webb & Holick (1988) empirical data:
 *   Boston Jan  (SZA=69°, O₃=340): factor = 0.019 → ~zero ✓
 *   Boston Feb  (SZA=60°, O₃=360): factor = 0.085 → negligible ✓
 *   Boston Jul  (SZA=27°, O₃=305): factor = 0.808 → full production ✓
 *   Miami Jan   (SZA=54°, O₃=270): factor = 0.279 → meaningful ✓
 *   Edmonton Oct (SZA=65°, O₃=285): factor = 0.041 → ~zero ✓
 *   Edmonton Mar (SZA=58°, O₃=400): factor = 0.040 → ~zero ✓
 *
 * Note: The spring/fall asymmetry (Edmonton Mar ≈ Edmonton Oct despite
 * lower SZA in March) is caused by ozone peaking in spring (400 DU)
 * vs. its minimum in fall (285 DU). The model captures this naturally.
 *
 * @param solarZenithAngle - Average SZA during outdoor period, in radians
 * @param ozoneColumn_DU - Total column ozone in Dobson Units
 * @returns Spectral efficiency factor (0 to ~1, relative to reference conditions)
 */
export function vitaminDSpectralEfficiency(
  solarZenithAngle: number,
  ozoneColumn_DU: number
): number {
  if (solarZenithAngle >= Math.PI / 2) return 0;

  // Physical constants
  const SIGMA_297 = 4.0e-19;  // Ozone cross-section at 297nm (cm²/molecule)
  const SIGMA_303 = 1.2e-19;  // Ozone cross-section at 303nm (cm²/molecule)
  const TAU_R_297 = 1.11;     // Rayleigh optical depth at 297nm (zenith)
  const TAU_R_303 = 1.03;     // Rayleigh optical depth at 303nm (zenith)
  const W_297 = 0.7;          // Action spectrum weight for 297nm band
  const W_303 = 0.3;          // Action spectrum weight for 303nm band
  const DU_TO_N = 2.687e16;   // molecules/cm² per Dobson Unit

  const N = ozoneColumn_DU * DU_TO_N; // Ozone column in molecules/cm²
  const m = airMassFactor(solarZenithAngle);

  // Total optical depth = ozone absorption + Rayleigh scattering, × air mass
  const tau_297 = (SIGMA_297 * N + TAU_R_297) * m;
  const tau_303 = (SIGMA_303 * N + TAU_R_303) * m;

  // Vitamin D-effective irradiance (arbitrary units)
  const I_vitD = W_297 * Math.exp(-tau_297) + W_303 * Math.exp(-tau_303);

  // Reference conditions: SZA=20°, ozone=300 DU (clear summer subtropical)
  // This is where Holick's rule (1000 IU per 0.25 MED × 0.25 BSA) was calibrated
  const SZA_REF = 20 * Math.PI / 180;
  const m_ref = airMassFactor(SZA_REF);
  const N_ref = 300 * DU_TO_N;
  const tau_297_ref = (SIGMA_297 * N_ref + TAU_R_297) * m_ref;
  const tau_303_ref = (SIGMA_303 * N_ref + TAU_R_303) * m_ref;
  const I_vitD_ref = W_297 * Math.exp(-tau_297_ref) + W_303 * Math.exp(-tau_303_ref);

  return Math.max(0, I_vitD / I_vitD_ref);
}

/**
 * Calculate daily vitamin D3 production from sun exposure.
 *
 * Based on the Holick equivalency model (Holick, 2007; Terushkin et al., 2010):
 * - 1/4 MED on 1/4 body surface area ≈ 1000 IU oral vitamin D3
 * - Natural sunlight is 1.32× more efficient than lab lamps (Sayre et al., 2007)
 *
 * The model incorporates:
 * 1. UV dose as fraction of MED
 * 2. Body surface area exposed
 * 3. Spectral efficiency (vitamin D UVB vs erythemal UV; McKenzie et al., 2009)
 * 4. Age-related decline
 * 5. Photoequilibrium saturation (Holick et al., 1981)
 *
 * PHOTOEQUILIBRIUM SATURATION:
 * Previtamin D3 absorbs the same UVB wavelengths that create it, converting
 * to inactive photoproducts (lumisterol, tachysterol). This creates a natural
 * ceiling on vitamin D production per exposure session.
 *
 * We model this with: VitD = Vmax × (1 - e^(-k × linearProd / Vmax))
 * where Vmax is the maximum single-session production (~20,000 IU for Type I,
 * scaling down with melanin) and k = 1.0 so that at low exposures the output
 * tracks the linear Holick model, saturating only near photoequilibrium.
 *
 * @param params - All factors affecting vitamin D synthesis
 * @returns Estimated vitamin D3 production in IU
 */
export function calculateVitaminDProduction(params: {
  uvIndex: number;
  durationMinutes: number;
  skinType: FitzpatrickType;
  ageGroup: AgeGroup;
  exposedSkinFraction: number; // 0-1
  solarZenithAngle: number; // radians — average during outdoor period
  ozoneColumn_DU: number; // total column ozone in Dobson Units
}): number {
  const { uvIndex, durationMinutes, skinType, ageGroup, exposedSkinFraction, solarZenithAngle, ozoneColumn_DU } = params;

  if (uvIndex <= 0 || durationMinutes <= 0 || exposedSkinFraction <= 0) return 0;

  // Step 1: Apply vitamin D spectral efficiency using Beer-Lambert atmospheric model.
  // This computes how much vitamin D-effective UVB (297nm, 303nm) survives the
  // atmosphere after ozone absorption and Rayleigh scattering, relative to reference
  // summer conditions. Accounts for both SZA AND ozone column (which varies by
  // season — peaking in spring, minimum in fall). This naturally reproduces the
  // "vitamin D winter" observed by Webb & Holick (1988).
  const spectralFactor = vitaminDSpectralEfficiency(solarZenithAngle, ozoneColumn_DU);
  if (spectralFactor < 0.005) return 0; // Below meaningful threshold

  // Step 2: Calculate cumulative UV dose and express as fraction of MED
  const dose_Jm2 = cumulativeUVDose(uvIndex, durationMinutes);
  const med = MED_VALUES[skinType].med_Jm2;
  const doseFraction = dose_Jm2 / med; // How many MEDs worth of exposure

  // Step 3: Base vitamin D production using Holick's equivalency
  // 0.25 MED × 0.25 BSA = 1000 IU (Holick, 2007)
  // Natural sunlight correction: ×1.32 (Sayre et al., 2007)
  const holickBase = 1000 * 1.32; // IU per (0.25 MED × 0.25 BSA)
  const linearProduction = holickBase * (doseFraction / 0.25) * (exposedSkinFraction / 0.25);

  // Step 4: Apply photoequilibrium saturation (Holick et al., 1981)
  const maxProduction = 20000 * melaninAttenuationFactor(skinType);
  const k = 1.0;
  const vitD_IU = maxProduction * (1 - Math.exp(-k * linearProduction / maxProduction));

  // Step 5: Apply spectral efficiency — reduces vitamin D production at high SZA
  // where erythemal UV is present but vitamin D-effective UVB is not
  const spectralAdjusted = vitD_IU * spectralFactor;

  // Step 6: Apply age correction (MacLaughlin & Holick, 1985)
  const ageFactor = ageSynthesisFactor(ageGroup);

  return Math.round(spectralAdjusted * ageFactor);
}

/**
 * Safe sun exposure time recommendation.
 *
 * Dermatological consensus recommends limiting unprotected sun exposure
 * to avoid sunburn while allowing some vitamin D synthesis.
 * A common guideline is 25-50% of 1 MED (Holick, 2007).
 *
 * We recommend up to 50% of 1 MED as the safe exposure limit,
 * which provides meaningful vitamin D without significant burn risk.
 *
 * @param uvIndex - Effective UV Index
 * @param skinType - Fitzpatrick skin type
 * @returns Recommended maximum unprotected exposure in minutes
 */
export function safeExposureTime(uvIndex: number, skinType: FitzpatrickType): number {
  const medTime = timeToOneMED(uvIndex, skinType);
  // 50% of MED time is a conservative safe limit
  return Math.round(medTime * 0.5);
}
