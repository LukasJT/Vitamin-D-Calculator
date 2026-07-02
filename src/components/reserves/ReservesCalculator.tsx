import { useMemo, useState } from 'react';
import {
  computeReserves,
  type ReservesInput,
  type SkinPhototype,
} from '../../lib/reserves';

const SKIN_LABELS: Record<SkinPhototype, string> = {
  1: 'I · Very fair, always burns',
  2: 'II · Fair, usually burns',
  3: 'III · Light-medium, sometimes burns',
  4: 'IV · Medium, rarely burns',
  5: 'V · Brown, very rarely burns',
  6: 'VI · Dark brown/black, never burns',
};

const STATUS_LABEL: Record<string, { label: string; color: string; text: string }> = {
  sufficient: { label: 'Sufficient', color: 'bg-emerald-500', text: 'text-emerald-700' },
  insufficient: { label: 'Insufficient', color: 'bg-amber-500', text: 'text-amber-700' },
  deficient: { label: 'Deficient', color: 'bg-orange-500', text: 'text-orange-700' },
  severely_deficient: { label: 'Severely deficient', color: 'bg-red-600', text: 'text-red-700' },
};

/** Default last-exposure date: end of local UVB season for a mid-latitude
 *  Northern-Hemisphere resident ≈ end of September. */
function defaultLastExposureDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const sept30 = new Date(year, 8, 30);
  const lastYearSept30 = new Date(year - 1, 8, 30);
  return (now < sept30 ? lastYearSept30 : sept30).toISOString().slice(0, 10);
}

export default function ReservesCalculator() {
  const [weeklyMinutes, setWeeklyMinutes] = useState(90);
  const [exposedFraction, setExposedFraction] = useState(0.28);
  const [skinType, setSkinType] = useState<SkinPhototype>(2);
  const [spf, setSpf] = useState(0);
  const [bmi, setBmi] = useState(24);
  const [age, setAge] = useState(35);
  const [lastExposureDate, setLastExposureDate] = useState(defaultLastExposureDate());
  const [useMeasured, setUseMeasured] = useState(false);
  const [measured, setMeasured] = useState(40);
  const [supplement, setSupplement] = useState(0);

  const input = useMemo<ReservesInput>(
    () => ({
      routine: { weeklyMinutes, exposedSkinFraction: exposedFraction, skinType, spf },
      body: { bmi, age },
      lastExposureDate,
      measured25OHD_ngmL: useMeasured ? measured : undefined,
      dailySupplement_IU: supplement,
    }),
    [weeklyMinutes, exposedFraction, skinType, spf, bmi, age, lastExposureDate, useMeasured, measured, supplement],
  );

  const result = useMemo(() => computeReserves(input), [input]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Latent Vitamin D Reserves Calculator
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Estimates your current serum <span className="italic">25-hydroxyvitamin D</span> [25(OH)D]
          concentration by modelling the depletion of cholecalciferol (vitamin D<sub>3</sub>) stored in
          your adipose tissue after the summer UVB season. Uses a two-compartment pharmacokinetic
          model with a BMI-adjusted terminal half-life of 60–90 days.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Summer routine &amp; body</h2>

          <Field label="Typical weekly midday UVB exposure" hint={`${weeklyMinutes} min/week`}>
            <input
              type="range" min={0} max={420} step={15}
              value={weeklyMinutes} onChange={(e) => setWeeklyMinutes(+e.target.value)}
              className="w-full accent-amber-500"
            />
          </Field>

          <Field label="Fraction of skin surface routinely exposed" hint={`${Math.round(exposedFraction * 100)}%`}>
            <input
              type="range" min={0.05} max={0.75} step={0.01}
              value={exposedFraction} onChange={(e) => setExposedFraction(+e.target.value)}
              className="w-full accent-amber-500"
            />
            <div className="text-xs text-gray-500 flex justify-between mt-1">
              <span>Face &amp; hands (5%)</span>
              <span>T-shirt (28%)</span>
              <span>Swimwear (60%+)</span>
            </div>
          </Field>

          <Field label="Fitzpatrick skin phototype">
            <select
              value={skinType}
              onChange={(e) => setSkinType(+e.target.value as SkinPhototype)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              {Object.entries(SKIN_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="Sunscreen SPF (during exposure)" hint={spf === 0 ? 'none' : `SPF ${spf}`}>
            <div className="flex gap-2 flex-wrap">
              {[0, 15, 30, 50].map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setSpf(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    spf === s ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                  }`}
                >
                  {s === 0 ? 'None' : `SPF ${s}`}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="BMI (kg/m²)" hint={bmi.toFixed(1)}>
              <input
                type="range" min={16} max={45} step={0.5}
                value={bmi} onChange={(e) => setBmi(+e.target.value)}
                className="w-full accent-amber-500"
              />
            </Field>
            <Field label="Age (years)" hint={`${age}`}>
              <input
                type="range" min={1} max={95} step={1}
                value={age} onChange={(e) => setAge(+e.target.value)}
                className="w-full accent-amber-500"
              />
            </Field>
          </div>

          <Field label="Last day of substantive UVB exposure">
            <input
              type="date"
              value={lastExposureDate}
              onChange={(e) => setLastExposureDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              End of the effective UVB season at your latitude — for most of the continental US &amp;
              southern Canada that is late September; for high-latitude sites (&gt; 55° N/S) it is
              typically mid-August.
            </p>
          </Field>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={useMeasured}
                onChange={(e) => setUseMeasured(e.target.checked)}
                className="accent-amber-500"
              />
              I have a recent serum 25(OH)D measurement
            </label>
            {useMeasured && (
              <Field label="Measured serum 25(OH)D" hint={`${measured} ng/mL · ${Math.round(measured * 2.5)} nmol/L`}>
                <input
                  type="range" min={5} max={80} step={1}
                  value={measured} onChange={(e) => setMeasured(+e.target.value)}
                  className="w-full accent-amber-500"
                />
              </Field>
            )}
          </div>

          <Field label="Current daily supplemental cholecalciferol" hint={supplement === 0 ? 'none' : `${supplement} IU/day`}>
            <input
              type="range" min={0} max={5000} step={100}
              value={supplement} onChange={(e) => setSupplement(+e.target.value)}
              className="w-full accent-amber-500"
            />
          </Field>
        </section>

        {/* Results */}
        <section className="space-y-5">
          <ResultHero result={result} />
          <MetricsGrid result={result} />
          <DecayChart result={result} />
          <ScienceCallout />
        </section>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-500 font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ResultHero({ result }: { result: ReturnType<typeof computeReserves> }) {
  const s = STATUS_LABEL[result.status];
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm p-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-medium text-amber-700 uppercase tracking-wider">
          Estimated current serum 25(OH)D
        </h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${s.color}`}>
          {s.label}
        </span>
      </div>
      <div className="text-5xl font-extrabold text-amber-600 mb-1">
        {result.current25OHD_ngmL} <span className="text-2xl font-semibold">ng/mL</span>
      </div>
      <p className="text-sm text-gray-600">
        ≈ {Math.round(result.current25OHD_ngmL * 2.5)} nmol/L · {result.daysSincePeak} days since your summer peak of {result.peak25OHD_ngmL} ng/mL
      </p>
    </div>
  );
}

function MetricsGrid({ result }: { result: ReturnType<typeof computeReserves> }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Cell label="Effective terminal t½" value={`${result.effectiveHalfLifeDays} d`} sub="two-compartment adipose model" />
      <Cell label="Suggested supplement" value={`${result.suggestedSupplement_IU.toLocaleString()} IU`} sub="cholecalciferol / day for 90 d" />
      <Cell
        label="Days until insufficiency (<30 ng/mL)"
        value={result.daysUntilInsufficient == null ? '—' : result.daysUntilInsufficient === 0 ? 'now' : `${result.daysUntilInsufficient} d`}
        sub="Endocrine Society threshold"
      />
      <Cell
        label="Days until deficiency (<20 ng/mL)"
        value={result.daysUntilDeficient == null ? '—' : result.daysUntilDeficient === 0 ? 'now' : `${result.daysUntilDeficient} d`}
        sub="IOM threshold"
      />
    </div>
  );
}

function Cell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function DecayChart({ result }: { result: ReturnType<typeof computeReserves> }) {
  const data = result.decayCurve;
  const W = 640, H = 220, P = { l: 44, r: 12, t: 20, b: 34 };
  const yMax = 60;
  const yMin = 0;
  const xToPx = (i: number) => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const yToPx = (v: number) => P.t + (1 - (v - yMin) / (yMax - yMin)) * (H - P.t - P.b);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(i)} ${yToPx(d.ng_per_mL)}`).join(' ');
  const thresholds = [
    { y: 30, label: 'Sufficient (30)', color: '#10b981' },
    { y: 20, label: 'Deficient (20)', color: '#f59e0b' },
    { y: 12, label: 'Severe (12)', color: '#dc2626' },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Projected serum 25(OH)D · next 180 days</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* y-axis grid */}
        {[0, 20, 30, 40, 50, 60].map((v) => (
          <g key={v}>
            <line x1={P.l} y1={yToPx(v)} x2={W - P.r} y2={yToPx(v)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={P.l - 6} y={yToPx(v) + 3} fontSize="9" fill="#6b7280" textAnchor="end" fontFamily="ui-monospace">
              {v}
            </text>
          </g>
        ))}
        {thresholds.map((t) => (
          <g key={t.y}>
            <line x1={P.l} y1={yToPx(t.y)} x2={W - P.r} y2={yToPx(t.y)} stroke={t.color} strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />
            <text x={W - P.r - 4} y={yToPx(t.y) - 3} fontSize="9" fill={t.color} textAnchor="end">{t.label}</text>
          </g>
        ))}
        {/* x-axis ticks every ~30 days */}
        {[0, 30, 60, 90, 120, 150, 180].map((d) => {
          const idx = Math.min(data.length - 1, Math.round(d / 7));
          return (
            <g key={d}>
              <line x1={xToPx(idx)} y1={H - P.b} x2={xToPx(idx)} y2={H - P.b + 4} stroke="#9ca3af" />
              <text x={xToPx(idx)} y={H - P.b + 15} fontSize="9" fill="#6b7280" textAnchor="middle">{d}d</text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <circle cx={xToPx(0)} cy={yToPx(data[0].ng_per_mL)} r="3.5" fill="#f59e0b" />
        <text x={W / 2} y={H - 4} fontSize="10" fill="#6b7280" textAnchor="middle">Days from today</text>
      </svg>
    </div>
  );
}

function ScienceCallout() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
      <p className="font-semibold mb-1">About this model</p>
      <p>
        Serum 25(OH)D decays with an effective terminal half-life of ~60 days in lean adults and up to ~90 days in
        obese adults, reflecting the slow release of cholecalciferol from adipose tissue
        (<a href="/how-it-works" className="underline">methodology</a>). This is a modelling estimate, not a
        substitute for a laboratory 25(OH)D measurement or clinical advice — see the{' '}
        <a href="/disclaimer" className="underline">medical disclaimer</a>.
      </p>
    </div>
  );
}
