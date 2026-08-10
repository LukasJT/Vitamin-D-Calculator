import type { APIRoute } from 'astro';

// Hand-curated article list. Kept in sync with the sitemap; anything with an
// article-like URL and a real update cadence belongs here.
const ARTICLES: { slug: string; title: string; description: string; date: string }[] = [
  { slug: '/vitamin-d-guide', title: 'The Complete Guide to Vitamin D', description: 'An in-depth, science-backed guide to vitamin D covering sources, deficiency risks, blood test levels, supplementation, and vitamin D winter.', date: '2026-05-01' },
  { slug: '/how-it-works', title: 'How the Vitamin D Calculator Works — The Science', description: 'The physics and physiology behind our sunlight-to-vitamin-D model.', date: '2026-05-01' },
  { slug: '/vitamin-d-reserves', title: 'Latent Vitamin D Reserves Calculator', description: 'Two-compartment pharmacokinetic model for stored cholecalciferol.', date: '2026-05-01' },
  { slug: '/blood-test-interpreter', title: 'Vitamin D Blood Test Result Interpreter', description: 'Interpret 25(OH)D results against IOM and Endocrine Society thresholds.', date: '2026-05-01' },
  { slug: '/vitamin-d-benefits', title: 'Vitamin D Benefits — Evidence-Ranked', description: 'What the trials actually show — bone health, immunity, cancer, and more.', date: '2026-05-01' },
  { slug: '/vitamin-d-deficiency-symptoms', title: 'Vitamin D Deficiency Symptoms', description: 'Nine common signs that serum 25(OH)D may be low.', date: '2026-05-01' },
  { slug: '/vitamin-d-dosage', title: 'Vitamin D Dosage Guide', description: 'RDA and repletion by age and baseline 25(OH)D level.', date: '2026-05-01' },
  { slug: '/vitamin-d-toxicity', title: 'Vitamin D Toxicity — Can You Take Too Much?', description: 'Upper limits, symptoms of hypervitaminosis D, and safety.', date: '2026-05-01' },
  { slug: '/vitamin-d-winter', title: 'Vitamin D Winter Explained', description: 'Latitude, UVB, and seasonal deficiency.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-immunity', title: 'Vitamin D and the Immune System', description: 'Cathelicidin, T-cell modulation, and respiratory infection evidence.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-osteoporosis', title: 'Vitamin D and Osteoporosis', description: 'Bone density, fractures, and dosing with calcium.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-sun-safety', title: 'Vitamin D and Sun Safety', description: 'Getting UVB without skin-cancer risk.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-hair-loss', title: 'Vitamin D and Hair Loss', description: 'Alopecia areata, telogen effluvium, and the evidence.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-weight-loss', title: 'Vitamin D and Weight Loss', description: 'What the evidence actually shows about vitamin D and body weight.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-mental-health', title: 'Vitamin D and Mental Health', description: 'Depression, SAD, and anxiety evidence.', date: '2026-05-01' },
  { slug: '/vitamin-d-in-pregnancy', title: 'Vitamin D in Pregnancy', description: 'Requirements, risks, and safe supplementation.', date: '2026-05-01' },
  { slug: '/vitamin-d-for-kids', title: 'Vitamin D for Kids', description: 'Dosages by age, breastfed infants, and deficiency signs.', date: '2026-05-01' },
  { slug: '/vitamin-d-in-elderly', title: 'Vitamin D in Older Adults', description: 'Falls, fractures, and dosing after 65.', date: '2026-05-01' },
  { slug: '/vitamin-d-half-life', title: 'Vitamin D Half-Life Explained', description: 'Pharmacokinetics and body-composition effects.', date: '2026-05-01' },
  { slug: '/vitamin-d-magnesium-k2', title: 'Vitamin D, Magnesium, and K2', description: 'Cofactor interactions explained.', date: '2026-05-01' },
  { slug: '/vitamin-d-vs-vitamin-d3', title: 'Vitamin D vs Vitamin D3', description: 'Cholecalciferol vs ergocalciferol compared.', date: '2026-05-01' },
  { slug: '/how-long-to-raise-vitamin-d', title: 'How Long Does It Take to Raise Vitamin D Levels?', description: 'Dose-response, time-to-steady-state, loading protocols.', date: '2026-05-01' },
  { slug: '/best-time-of-day-for-vitamin-d', title: 'Best Time of Day for Vitamin D', description: 'Sun timing vs. supplement timing.', date: '2026-05-01' },
  { slug: '/how-to-take-vitamin-d', title: 'How to Take Vitamin D', description: 'Drops, capsules, chewables, timing, and cofactors.', date: '2026-05-01' },
  { slug: '/vitamin-d-testing-guide', title: 'Vitamin D Testing Guide', description: 'What to order, prep, cost, and re-testing.', date: '2026-05-01' },
  { slug: '/vitamin-d-foods', title: 'Foods High in Vitamin D', description: 'Searchable table with IU per serving.', date: '2026-05-01' },
  { slug: '/glossary', title: 'Vitamin D Glossary', description: 'Terminology and abbreviations reference.', date: '2026-05-01' },
  { slug: '/vitamin-d-and-diabetes', title: 'Vitamin D and Diabetes', description: 'Insulin resistance, T2D prevention, D2d trial data.', date: '2026-05-15' },
  { slug: '/vitamin-d-and-testosterone', title: 'Vitamin D and Testosterone', description: 'What supplementation does for male hormones in deficient vs sufficient men.', date: '2026-05-15' },
  { slug: '/vitamin-d-and-thyroid', title: 'Vitamin D and Thyroid Disease', description: "Hashimoto's, Graves', and TPO antibody evidence.", date: '2026-05-15' },
  { slug: '/vitamin-d-and-sleep', title: 'Vitamin D and Sleep', description: 'Insomnia, sleep quality, and OSA associations.', date: '2026-05-15' },
  { slug: '/vitamin-d-for-vegans', title: 'Vitamin D for Vegans', description: 'Lichen D3, D2, mushrooms, and fortified plant sources.', date: '2026-05-15' },
  { slug: '/vitamin-d-absorption-issues', title: 'Vitamin D Absorption Issues', description: 'Malabsorption, medications, and bariatric surgery.', date: '2026-05-15' },
  { slug: '/vitamin-d-and-pcos', title: 'Vitamin D and PCOS', description: 'Insulin sensitivity, ovulation, and fertility in PCOS.', date: '2026-05-20' },
  { slug: '/vitamin-d-and-heart-health', title: 'Vitamin D and Heart Health', description: 'BP, cardiovascular events, and the VITAL trial.', date: '2026-05-20' },
  { slug: '/vitamin-d-and-cancer', title: 'Vitamin D and Cancer', description: 'Incidence, mortality, and type-by-type evidence.', date: '2026-05-20' },
  { slug: '/vitamin-d-and-cognitive-decline', title: 'Vitamin D and Cognitive Decline', description: "Dementia and Alzheimer's risk associations.", date: '2026-05-20' },
  { slug: '/vitamin-d-and-psoriasis', title: 'Vitamin D and Psoriasis', description: 'Topical calcipotriene, UVB, and oral adjunct therapy.', date: '2026-05-20' },
  { slug: '/vitamin-d-and-fibromyalgia', title: 'Vitamin D and Fibromyalgia', description: 'Chronic pain and osteomalacia mimicry.', date: '2026-05-20' },
  { slug: '/vitamins', title: 'Vitamins & Minerals Complete Reference', description: 'Index of every essential vitamin and mineral with dosing and food sources.', date: '2026-06-01' },
  { slug: '/vitamin-b12', title: 'Vitamin B12 (Cobalamin)', description: 'Pernicious anaemia, neurological deficiency, methylcobalamin.', date: '2026-06-01' },
  { slug: '/vitamin-c', title: 'Vitamin C (Ascorbic Acid)', description: 'Collagen synthesis, cold and flu evidence, scurvy.', date: '2026-06-01' },
  { slug: '/vitamin-a', title: 'Vitamin A (Retinol)', description: 'Retinol vs beta-carotene; teratogenicity; toxicity.', date: '2026-06-01' },
  { slug: '/vitamin-e', title: 'Vitamin E (Alpha-Tocopherol)', description: 'Antioxidant lipid protection; why supplementation trials disappointed.', date: '2026-06-01' },
  { slug: '/vitamin-k', title: 'Vitamin K', description: 'K1 for coagulation, K2 for bone and vascular calcification.', date: '2026-06-01' },
  { slug: '/folate', title: 'Folate (Vitamin B9)', description: 'Neural tube defect prevention, MTHFR polymorphisms.', date: '2026-06-01' },
  { slug: '/magnesium', title: 'Magnesium', description: 'Cofactor for 300+ enzymes; glycinate/citrate/oxide compared.', date: '2026-06-01' },
  { slug: '/iron', title: 'Iron', description: 'Iron deficiency anaemia, ferritin, alternate-day dosing.', date: '2026-06-01' },
  { slug: '/zinc', title: 'Zinc', description: 'Immunity, wound healing, cold lozenge evidence.', date: '2026-06-01' },
  { slug: '/calcium', title: 'Calcium', description: 'RDA, food-first approach, carbonate vs citrate, kidney stones and arterial calcification debate.', date: '2026-08-10' },
  { slug: '/omega-3', title: 'Omega-3 (EPA and DHA)', description: 'REDUCE-IT, STRENGTH, VITAL trial evidence; fish oil vs algae oil; triglyceride reduction.', date: '2026-08-10' },
  { slug: '/choline', title: 'Choline', description: 'Brain and fetal neurodevelopment, non-alcoholic fatty liver, and the nutrient 90% of adults miss.', date: '2026-08-10' },
  { slug: '/vitamin-b6', title: 'Vitamin B6 (Pyridoxine)', description: 'Morning sickness, PMS, and the sensory neuropathy toxicity risk with chronic high-dose supplements.', date: '2026-08-10' },
  { slug: '/vitamin-b1', title: 'Vitamin B1 (Thiamine)', description: 'Beriberi, Wernicke-Korsakoff, refeeding syndrome, and the alcohol and loop-diuretic depletion risk.', date: '2026-08-10' },
  { slug: '/vitamin-b3', title: 'Vitamin B3 (Niacin)', description: 'Pellagra, the AIM-HIGH and HPS2-THRIVE failures, niacin flush, and the newer NAD+ precursors (NR, NMN).', date: '2026-08-11' },
  { slug: '/biotin', title: 'Biotin (Vitamin B7)', description: 'The hair-and-nails evidence check and the FDA warning about biotin interfering with troponin and thyroid tests.', date: '2026-08-11' },
  { slug: '/selenium', title: 'Selenium', description: "Thyroid, Hashimoto's TPO evidence, SELECT trial, brazil-nut dosing and the narrowest nutrient safety margin.", date: '2026-08-11' },
  { slug: '/vitamin-d-and-covid', title: 'Vitamin D and COVID-19', description: 'Observational deficiency signal vs the CORONAVIT and Cochrane 2023 randomised-trial verdict.', date: '2026-08-11' },
  { slug: '/vitamin-d-and-multiple-sclerosis', title: 'Vitamin D and Multiple Sclerosis', description: 'Latitude gradient, Mendelian-randomisation evidence, SOLAR and CHOLINE trials, MS-specific 25(OH)D targets.', date: '2026-08-11' },
  { slug: '/vitamin-d-and-asthma', title: 'Vitamin D and Asthma', description: 'Cochrane meta-analysis, VIDA trial, VDAART pregnancy trial, and dosing for adults with poorly controlled asthma.', date: '2026-08-11' },
  { slug: '/vitamin-d-and-acne', title: 'Vitamin D and Acne', description: 'The deficiency link in inflammatory acne and what the small supplementation RCTs actually show.', date: '2026-08-11' },
  { slug: '/vitamin-b2', title: 'Vitamin B2 (Riboflavin)', description: 'Migraine prophylaxis (400 mg/day), MTHFR interaction, and why B-complex urine glows yellow.', date: '2026-08-12' },
  { slug: '/vitamin-b5', title: 'Vitamin B5 (Pantothenic Acid)', description: 'CoA cofactor, the acne megadose claim, panthenol in cosmetics, and why deficiency is unheard of.', date: '2026-08-12' },
  { slug: '/potassium', title: 'Potassium', description: 'DASH diet, salt substitutes, SSaSS trial, banana myth, and the hyperkalaemia ceiling.', date: '2026-08-12' },
  { slug: '/iodine', title: 'Iodine', description: 'Thyroid hormone synthesis, pregnancy requirements, salt iodisation history, and the kelp overdose risk.', date: '2026-08-12' },
  { slug: '/vitamin-d-and-ibd', title: "Vitamin D and IBD (Crohn's & UC)", description: 'Deficiency is the norm; latitude gradient, MR evidence, supplementation trials, malabsorption dosing.', date: '2026-08-12' },
  { slug: '/vitamin-d-and-migraine', title: 'Vitamin D and Migraine', description: 'What supplementation trials show, mechanism via neuroinflammation, and combining with riboflavin and magnesium.', date: '2026-08-12' },
  { slug: '/vitamin-d-and-eczema', title: 'Vitamin D and Eczema (Atopic Dermatitis)', description: 'Winter flares, cathelicidin and skin barrier defence, RCT evidence for SCORAD improvement.', date: '2026-08-12' },
];

export const GET: APIRoute = async () => {
  const SITE = 'https://vitamindcalculator.net';
  const rfc822 = (d: string) => new Date(d + 'T12:00:00Z').toUTCString();
  const items = ARTICLES.map((a) => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE}${a.slug}</link>
      <guid isPermaLink="true">${SITE}${a.slug}</guid>
      <pubDate>${rfc822(a.date)}</pubDate>
      <description>${escapeXml(a.description)}</description>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vitamin D Calculator</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Science-based tools and guides for understanding your vitamin D needs.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
