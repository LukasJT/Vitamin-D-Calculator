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
  { slug: '/vitamin-d-and-rheumatoid-arthritis', title: 'Vitamin D and Rheumatoid Arthritis', description: 'DAS28 correlations, the VITAL autoimmune substudy, and dosing alongside DMARDs and glucocorticoids.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-lupus', title: 'Vitamin D and Lupus (SLE)', description: 'The photosensitivity paradox, SLEDAI evidence, and supplementation dosing when sun exposure is off-limits.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-copd', title: 'Vitamin D and COPD', description: 'ViDiCO trial, Cochrane review, and the strong deficient-subgroup exacerbation benefit.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-kidney-disease', title: 'Vitamin D and Chronic Kidney Disease', description: 'CKD-MBD, calcitriol vs paricalcitol vs cholecalciferol, and KDIGO guidance across CKD stages.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-liver-disease', title: 'Vitamin D and Liver Disease', description: 'NAFLD supplementation evidence, cirrhosis universal deficiency, and when calcifediol is required.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-dental-health', title: 'Vitamin D and Dental Health', description: 'Caries reduction, periodontitis progression, implant osseointegration, and enamel hypoplasia.', date: '2026-08-13' },
  { slug: '/vitamin-d-and-eye-health', title: 'Vitamin D and Eye Health', description: 'AMD, dry eye, myopia and diabetic retinopathy — what evidence supports and what it does not.', date: '2026-08-13' },
  { slug: '/vitamin-d-for-athletes', title: 'Vitamin D for Athletes', description: 'Indoor-sport deficiency, muscle strength and stress fractures, target 40–50 ng/mL for elite performance.', date: '2026-08-13' },
  { slug: '/vitamin-d-for-men', title: 'Vitamin D for Men', description: 'Testosterone, sperm quality, cardiovascular, muscle, prostate — the men-specific evidence in one place.', date: '2026-08-14' },
  { slug: '/vitamin-d-for-women', title: 'Vitamin D for Women', description: 'Bones, pregnancy, PCOS, endometriosis, menopause — dosing across the reproductive lifespan.', date: '2026-08-14' },
  { slug: '/vitamin-d-loading-dose', title: 'Vitamin D Loading Dose Protocols', description: 'Standard 50,000 IU weekly regimens, when loading makes sense, and why annual megadoses backfire.', date: '2026-08-14' },
  { slug: '/vitamin-d-daily-vs-weekly', title: 'Daily vs Weekly vs Monthly Vitamin D', description: 'How dosing cadence affects 25(OH)D, compliance, and clinical outcomes — and why annual bolus dosing fails.', date: '2026-08-14' },
  { slug: '/uv-lamps-for-vitamin-d', title: 'UV Lamps for Vitamin D', description: 'Which lamps actually produce vitamin D (UVB 290–315 nm), which do not, and why supplements usually win.', date: '2026-08-14' },
  { slug: '/vitamin-d-and-shift-work', title: 'Vitamin D and Shift Work', description: 'Why night-shift and indoor workers run deficient year-round and how to dose supplements.', date: '2026-08-14' },
  { slug: '/vitamin-d-and-skin-color', title: 'Vitamin D and Skin Color (Fitzpatrick Types)', description: 'How melanin filters UVB, the synthesis gap between Fitzpatrick I and VI, and skin-type-specific supplementation.', date: '2026-08-14' },
  { slug: '/vitamin-d-and-long-covid', title: 'Vitamin D and Long COVID', description: 'Observational associations, mechanistic angles, and reasonable dosing for PASC recovery.', date: '2026-08-14' },
  { slug: '/copper', title: 'Copper', description: "Ceruloplasmin, zinc-induced deficiency, Wilson's disease, and Menkes disease.", date: '2026-08-15' },
  { slug: '/chromium', title: 'Chromium', description: 'The blood-sugar and weight-loss claims, chromium picolinate, and the EFSA reclassification.', date: '2026-08-15' },
  { slug: '/manganese', title: 'Manganese', description: 'MnSOD cofactor, welding-fume manganism, and why supplementation is rarely warranted.', date: '2026-08-15' },
  { slug: '/molybdenum', title: 'Molybdenum', description: 'Sulfite oxidase and xanthine oxidase cofactor, the Abumrad TPN case, and why food covers it easily.', date: '2026-08-15' },
  { slug: '/fluoride', title: 'Fluoride', description: 'Water fluoridation, dental fluorosis, skeletal fluorosis, and the caries-prevention evidence.', date: '2026-08-15' },
  { slug: '/vitamin-d-and-hashimoto', title: "Vitamin D and Hashimoto's Thyroiditis", description: 'TPO antibody reduction in trials, selenium adjunct, and dosing guidance.', date: '2026-08-15' },
  { slug: '/vitamin-d-and-endometriosis', title: 'Vitamin D and Endometriosis', description: 'Pain reduction evidence, mechanism via NF-κB and COX-2 suppression, dosing.', date: '2026-08-15' },
  { slug: '/vitamin-d-and-fertility', title: 'Vitamin D and Fertility', description: 'IVF live birth rates, sperm parameters, PCOS ovulation, and pre-conception dosing.', date: '2026-08-15' },
  { slug: '/vitamin-d-and-ibs', title: 'Vitamin D and Irritable Bowel Syndrome', description: 'Deficiency prevalence, IBS-SSS trial results with intermittent bolus dosing, and where the evidence is weaker.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-back-pain', title: 'Vitamin D and Chronic Low Back Pain', description: 'Osteomalacia mimicry, the Al Faraj study, and how correction helps deficient patients.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-gout', title: 'Vitamin D and Gout', description: 'Uric acid observational associations, VITAL substudy null, and what actually reduces attacks.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-adhd', title: 'Vitamin D and ADHD', description: 'Deficiency link in ADHD children, adjunctive trials with methylphenidate, and where to be sceptical.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-autism', title: 'Vitamin D and Autism Spectrum Disorder', description: 'Prenatal maternal 25(OH)D associations, small ASD supplementation trials, and warning on unproven high-dose protocols.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-chronic-pain', title: 'Vitamin D and Chronic Pain', description: 'Pain-clinic deficiency prevalence, RCT evidence by pain type, and opioid-sparing potential.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-vitiligo', title: 'Vitamin D and Vitiligo', description: 'Topical calcipotriene, narrowband UVB, oral repletion, and where JAK inhibitors changed the field.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-alopecia-areata', title: 'Vitamin D and Alopecia Areata', description: 'Deficiency correlation with SALT score, topical calcipotriol, and where baricitinib and ritlecitinib fit in.', date: '2026-08-16' },
  { slug: '/vitamin-d-and-cystic-fibrosis', title: 'Vitamin D and Cystic Fibrosis', description: 'CF Foundation targets, water-miscible cholecalciferol, CF-related bone disease and CFTR modulator questions.', date: '2026-08-17' },
  { slug: '/vitamin-d-and-bariatric-surgery', title: 'Vitamin D After Bariatric Surgery', description: 'ASMBS dosing by procedure (sleeve, RYGB, BPD-DS), water-miscible formulations, secondary hyperparathyroidism.', date: '2026-08-17' },
  { slug: '/vitamin-d-and-menopause', title: 'Vitamin D and Menopause', description: 'Bone loss with HRT/bisphosphonates, falls prevention, and what vitamin D does NOT treat (hot flashes, weight gain, GSM).', date: '2026-08-17' },
  { slug: '/vitamin-d-with-magnesium', title: 'Vitamin D With Magnesium', description: 'Magnesium as a cofactor for every enzyme in vitamin D activation, best forms, and combined dosing.', date: '2026-08-17' },
  { slug: '/vitamin-d-drops-vs-capsules', title: 'Vitamin D Drops vs Capsules vs Sprays', description: 'Head-to-head of vitamin D formulations, when to use each, and cost per IU.', date: '2026-08-17' },
  { slug: '/vitamin-d-and-obesity', title: 'Vitamin D and Obesity', description: 'The volumetric dilution effect, dosing adjustments by BMI, and what weight loss does to serum 25(OH)D.', date: '2026-08-17' },
  { slug: '/vitamin-d-drug-interactions', title: 'Vitamin D Drug Interactions', description: 'Anticonvulsants, glucocorticoids, thiazides, digoxin, orlistat, cholestyramine, ketoconazole — the interaction list.', date: '2026-08-17' },
  { slug: '/vitamin-d-and-alcohol', title: 'Vitamin D and Alcohol', description: 'Why chronic alcohol causes severe deficiency (hepatic, malabsorption, dietary), bone consequences, and dosing.', date: '2026-08-17' },
  { slug: '/vitamin-d-and-breast-cancer', title: 'Vitamin D and Breast Cancer', description: 'VITAL and WHI prevention evidence, survival data, and aromatase inhibitor arthralgia relief.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-colorectal-cancer', title: 'Vitamin D and Colorectal Cancer', description: 'SUNSHINE trial in metastatic disease, adenoma prevention, and observational survival data.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-prostate-cancer', title: 'Vitamin D and Prostate Cancer', description: 'SELECT, VITAL, Marshall active surveillance trial, ADT bone protection, racial disparities.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-skin-cancer', title: 'Vitamin D and Skin Cancer', description: 'BCC, SCC, melanoma — untangling the sun/vitamin D trade-off and why supplementing beats tanning.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-parkinsons', title: "Vitamin D and Parkinson's Disease", description: 'High deficiency prevalence, UPDRS supplementation trials, substantia nigra VDR biology, falls prevention.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-flu', title: 'Vitamin D and Influenza', description: 'Martineau IPD meta-analysis, Urashima school children trial, why daily/weekly works and bolus does not.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-gestational-diabetes', title: 'Vitamin D and Gestational Diabetes', description: 'Deficiency association, DALI trial, dosing during pregnancy, and postpartum T2D risk.', date: '2026-08-18' },
  { slug: '/vitamin-d-for-infants', title: 'Vitamin D for Infants', description: 'AAP 400 IU recommendation, breastfed vs formula-fed, rickets prevention, and the maternal 6,400 IU alternative.', date: '2026-08-18' },
  { slug: '/vitamin-d-and-preterm-birth', title: 'Vitamin D and Preterm Birth', description: 'Maternal 25(OH)D and preterm risk, RCT evidence, preterm-infant dosing and metabolic bone disease.', date: '2026-08-18' },
  { slug: '/vitamin-d-by-month', title: 'Vitamin D by Month of the Year', description: 'A month-by-month walk through the Northern Hemisphere UVB cycle from Jan nadir to Jun peak, with dosing.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-cloud-cover', title: 'Vitamin D and Cloud Cover', description: 'How thin cirrus, thick stratocumulus, wildfire smoke and marine fog change ground-level UVB.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-clothing', title: 'Vitamin D and What You Wear', description: 'Body surface area exposed, UPF fabric ratings, cultural dress, and dosing for high-coverage patterns.', date: '2026-08-19' },
  { slug: '/vitamin-d-by-latitude', title: 'Vitamin D by Latitude', description: 'The 37° UVB rule, months of vitamin D winter by city from Miami to Reykjavik, polar day and night.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-climate', title: 'Vitamin D and Climate', description: 'Beyond latitude — Mediterranean, temperate, tropical, oceanic, desert, monsoon, polar climate impacts.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-windows', title: 'Vitamin D Through a Window', description: 'Standard glass blocks ~99% of UVB — the office and car window vitamin D reality check.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-sunscreen', title: 'Vitamin D and Sunscreen', description: 'Does SPF 30 cause deficiency? What real-world sunscreen use actually does to serum 25(OH)D.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-air-pollution', title: 'Vitamin D and Air Pollution', description: 'How particulate haze, wildfire smoke, ozone and volcanic dust reduce UVB reaching the ground.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-altitude', title: 'Vitamin D and Altitude', description: 'The 4%-per-300m UVB gain, snow reflectance nearly doubling exposure, and mountain sunburn hazard.', date: '2026-08-19' },
  { slug: '/vitamin-d-and-time-of-day', title: 'Vitamin D and Time of Day', description: "Why noon sun makes vitamin D and morning/evening sun doesn't — the shadow rule and 35° threshold.", date: '2026-08-19' },
  { slug: '/vitamin-d-supplementation-guide', title: 'Complete Vitamin D Supplementation Guide', description: 'Dose, form, timing, cofactors, and monitoring — the seven-step guide to effective supplementation.', date: '2026-08-20' },
  { slug: '/vitamin-d-and-seasonal-affective-disorder', title: 'Vitamin D and SAD', description: 'SAD lamps vs vitamin D — two different winter problems, two different treatments, and where they overlap.', date: '2026-08-20' },
  { slug: '/vitamin-d-and-vacation', title: 'Vitamin D and Vacation', description: 'How much a sunny trip actually boosts 25(OH)D, how long it lasts, and the melanoma trade-off.', date: '2026-08-20' },
  { slug: '/vitamin-d-and-hot-climates', title: 'Vitamin D in Hot and Desert Climates', description: 'Why the sunniest countries have some of the highest deficiency rates — Saudi Arabia, UAE, Iran.', date: '2026-08-20' },
  { slug: '/vitamin-d-supplement-buyers-guide', title: "Vitamin D Supplement Buyer's Guide", description: 'Third-party testing, bioavailability, cost per IU, and supplement red flags to avoid.', date: '2026-08-20' },
  { slug: '/vitamin-d-and-humidity', title: 'Vitamin D and Humidity', description: 'Does humidity meaningfully change UVB? Why sweat does not wash off freshly-synthesised cholecalciferol.', date: '2026-08-21' },
  { slug: '/vitamin-d-and-tanning-beds', title: 'Vitamin D and Tanning Beds', description: 'The melanoma trade-off, IARC Group 1 classification, and why supplements are always the better answer.', date: '2026-08-21' },
  { slug: '/vitamin-d-and-shade', title: 'Vitamin D and Shade', description: 'How umbrellas, canopy, dappled shade still transmit meaningful UVB — and the sunburn deception.', date: '2026-08-21' },
  { slug: '/vitamin-d-food-meal-plan', title: 'High-Vitamin D Meal Plan Ideas', description: 'Three sample days that hit the RDA from food alone, plus a vegan variant, and the reality check.', date: '2026-08-21' },
  { slug: '/vitamin-d-and-fatigue', title: 'Vitamin D and Fatigue', description: 'When correcting deficiency actually improves tiredness — and when to look elsewhere for the cause.', date: '2026-08-21' },
  { slug: '/vitamin-d-and-common-cold', title: 'Vitamin D and the Common Cold', description: 'Martineau meta-analysis specifics, cathelicidin biology, and why daily works for cold prevention.', date: '2026-08-21' },
  { slug: '/vitamin-d-and-headaches', title: 'Vitamin D and Headaches', description: 'Non-migraine headache types — tension, cluster, cervicogenic — and where vitamin D fits.', date: '2026-08-21' },
  { slug: '/vitamin-d-in-the-uk', title: 'Vitamin D in the UK', description: 'PHE guidance, why nobody makes vitamin D in the UK from October to March, and NHS recommendations.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-canada', title: 'Vitamin D in Canada', description: 'Health Canada RDAs, milk fortification history, and the Nunavut / NWT northern-community deficiency issue.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-australia', title: 'Vitamin D in Australia', description: 'Cancer Council balance between sun-safety and vitamin D, latitude gradient from Darwin to Hobart.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-us', title: 'Vitamin D in the United States', description: 'IOM vs Endocrine Society RDA debate, NHANES deficiency data, milk fortification history.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-india', title: 'Vitamin D in India', description: 'The sun-rich, deficient paradox — urban indoor lifestyles, dark skin, air pollution, vegetarian diet.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-scandinavia', title: 'Vitamin D in Scandinavia', description: 'Cod liver oil tradition, NNR 2023, polar-night deficiency, and migrant-population rates.', date: '2026-08-22' },
  { slug: '/vitamin-d-in-middle-east', title: 'Vitamin D in the Middle East', description: 'Global-record deficiency rates in the sunniest countries — the cultural, climatic, and dietary explanation.', date: '2026-08-22' },
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
