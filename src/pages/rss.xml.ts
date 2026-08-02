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
