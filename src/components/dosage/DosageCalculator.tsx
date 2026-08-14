import { useMemo, useState } from 'react';
import { computeDosage, type DosageInput, type MeasurementUnit } from '../../lib/dosage';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  sufficient: { label: 'Sufficient', color: 'bg-emerald-500' },
  insufficient: { label: 'Insufficient', color: 'bg-amber-500' },
  deficient: { label: 'Deficient', color: 'bg-orange-500' },
  severely_deficient: { label: 'Severely deficient', color: 'bg-red-600' },
};

export default function DosageCalculator() {
  const [unit, setUnit] = useState<MeasurementUnit>('ng/mL');
  const [current, setCurrent] = useState(18);
  const [target, setTarget] = useState(40);
  const [weightKg, setWeightKg] = useState(75);
  const [useLb, setUseLb] = useState(false);
  const [bmi, setBmi] = useState(24);
  const [malabsorption, setMalabsorption] = useState(false);

  // When switching units, convert the entered current/target so the numbers stay sensible.
  function switchUnit(next: MeasurementUnit) {
    if (next === unit) return;
    const factor = next === 'nmol/L' ? 2.5 : 1 / 2.5;
    setCurrent((c) => Math.round(c * factor));
    setTarget((t) => Math.round(t * factor));
    setUnit(next);
  }

  const input = useMemo<DosageInput>(
    () => ({ current, target, unit, weightKg, bmi, malabsorption }),
    [current, target, unit, weightKg, bmi, malabsorption],
  );
  const result = useMemo(() => computeDosage(input), [input]);
  const s = STATUS_LABEL[result.status];

  const displayWeight = useLb ? Math.round(weightKg / 0.453592) : weightKg;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Vitamin D Dosage Calculator
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Estimates the total loading dose of vitamin D<sub>3</sub> (cholecalciferol) needed to raise
          your serum <span className="italic">25-hydroxyvitamin D</span> [25(OH)D] from your current
          level to a target, plus the daily maintenance dose to hold it there. Uses the weight-based
          repletion formula validated by Van Groningen (2010): <span className="whitespace-nowrap font-mono text-base">40&nbsp;IU/kg</span> per
          nmol/L of deficit.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Your numbers</h2>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              {(['ng/mL', 'nmol/L'] as MeasurementUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => switchUnit(u)}
                  className={`px-3 py-1.5 transition-colors ${unit === u ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <Field label="Current serum 25(OH)D" hint={`${current} ${unit}`}>
            <input
              type="range"
              min={unit === 'ng/mL' ? 4 : 10}
              max={unit === 'ng/mL' ? 60 : 150}
              step={1}
              value={current}
              onChange={(e) => setCurrent(+e.target.value)}
              className="w-full accent-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">From your most recent blood test.</p>
          </Field>

          <Field label="Target serum 25(OH)D" hint={`${target} ${unit}`}>
            <input
              type="range"
              min={unit === 'ng/mL' ? 20 : 50}
              max={unit === 'ng/mL' ? 70 : 175}
              step={1}
              value={target}
              onChange={(e) => setTarget(+e.target.value)}
              className="w-full accent-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Most guidelines aim for 30–50 ng/mL (75–125 nmol/L).
            </p>
          </Field>

          <Field
            label="Body weight"
            hint={useLb ? `${displayWeight} lb` : `${displayWeight} kg`}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={useLb ? 66 : 30}
                max={useLb ? 330 : 150}
                step={1}
                value={displayWeight}
                onChange={(e) => setWeightKg(useLb ? +e.target.value * 0.453592 : +e.target.value)}
                className="w-full accent-amber-500"
              />
              <button
                type="button"
                onClick={() => setUseLb((v) => !v)}
                className="shrink-0 px-2 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:border-amber-400"
              >
                {useLb ? 'lb' : 'kg'}
              </button>
            </div>
          </Field>

          <Field label="BMI (kg/m²)" hint={bmi.toFixed(1)}>
            <input
              type="range" min={16} max={45} step={0.5}
              value={bmi} onChange={(e) => setBmi(+e.target.value)}
              className="w-full accent-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher BMI raises the maintenance requirement (adipose dilution).
            </p>
          </Field>

          <label className="flex items-start gap-2 text-sm text-gray-700 pt-1">
            <input
              type="checkbox"
              checked={malabsorption}
              onChange={(e) => setMalabsorption(e.target.checked)}
              className="accent-amber-500 mt-0.5"
            />
            <span>
              Fat malabsorption (coeliac, Crohn's, bariatric surgery, cystic fibrosis, cholestasis) —
              increases the dose needed.
            </span>
          </label>
        </section>

        {/* Results */}
        <section className="space-y-5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-medium text-amber-700 uppercase tracking-wider">
                Total loading dose to reach target
              </h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${s.color}`}>
                {s.label} now
              </span>
            </div>
            <div className="text-5xl font-extrabold text-amber-600 mb-1">
              {result.totalRepletionIU === 0 ? '—' : result.totalRepletionIU.toLocaleString()}{' '}
              <span className="text-2xl font-semibold">IU</span>
            </div>
            <p className="text-sm text-gray-600">
              {result.totalRepletionIU === 0
                ? 'Already at or above your target — no loading dose needed.'
                : `To raise 25(OH)D from ${result.currentNg} to ${result.targetNg} ng/mL, delivered over the schedules below.`}
            </p>
          </div>

          {result.loadingRegimens.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Loading schedule options</h3>
              <ul className="space-y-3">
                {result.loadingRegimens.map((r) => (
                  <li key={r.label} className="border-l-2 border-amber-400 pl-3">
                    <p className="font-semibold text-gray-800">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Cell
              label="Daily maintenance dose"
              value={`${result.maintenanceIU.toLocaleString()} IU`}
              sub={`holds ≈ ${result.targetNg} ng/mL · ${result.maintenanceMultiplier}× lean requirement`}
            />
            <Cell
              label="≈ Micrograms"
              value={`${Math.round(result.maintenanceIU / 40)} µg`}
              sub="1 µg = 40 IU cholecalciferol"
            />
          </div>

          {result.targetWarning && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900 leading-relaxed">
              {result.targetWarning}
            </div>
          )}

          <RiseChart projection={result.projection} target={result.targetNg} />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
            <p className="font-semibold mb-1">Educational estimate — not a prescription</p>
            <p>
              Dosing is anchored to Van Groningen (2010) and Heaney (2003) dose-response data. High
              loading doses and any dose above 4,000 IU/day long-term should be supervised with
              follow-up 25(OH)D testing. Do not act on this without a clinician if you have kidney
              disease, hyperparathyroidism, sarcoidosis, or take thiazides — see the{' '}
              <a href="/disclaimer" className="underline">medical disclaimer</a> and our{' '}
              <a href="/vitamin-d-toxicity" className="underline">toxicity guide</a>.
            </p>
          </div>
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

function Cell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function RiseChart({ projection, target }: { projection: { day: number; ng: number }[]; target: number }) {
  const W = 640, H = 220, P = { l: 44, r: 12, t: 20, b: 34 };
  const yMax = Math.max(60, Math.ceil((target + 10) / 10) * 10);
  const xToPx = (i: number) => P.l + (i / (projection.length - 1)) * (W - P.l - P.r);
  const yToPx = (v: number) => P.t + (1 - v / yMax) * (H - P.t - P.b);
  const path = projection.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(i)} ${yToPx(d.ng)}`).join(' ');
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Rise on the maintenance dose alone · next 180 days
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0, 20, 30, 40, 50, 60].filter((v) => v <= yMax).map((v) => (
          <g key={v}>
            <line x1={P.l} y1={yToPx(v)} x2={W - P.r} y2={yToPx(v)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={P.l - 6} y={yToPx(v) + 3} fontSize="9" fill="#6b7280" textAnchor="end" fontFamily="ui-monospace">{v}</text>
          </g>
        ))}
        <line x1={P.l} y1={yToPx(target)} x2={W - P.r} y2={yToPx(target)} stroke="#10b981" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
        <text x={W - P.r - 4} y={yToPx(target) - 3} fontSize="9" fill="#10b981" textAnchor="end">Target ({target})</text>
        {[0, 30, 60, 90, 120, 150, 180].map((d) => {
          const idx = Math.round(d / 15);
          return (
            <g key={d}>
              <line x1={xToPx(idx)} y1={H - P.b} x2={xToPx(idx)} y2={H - P.b + 4} stroke="#9ca3af" />
              <text x={xToPx(idx)} y={H - P.b + 15} fontSize="9" fill="#6b7280" textAnchor="middle">{d}d</text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <text x={W / 2} y={H - 4} fontSize="10" fill="#6b7280" textAnchor="middle">
          Days on maintenance dose (a loading dose reaches target far sooner)
        </text>
      </svg>
    </div>
  );
}
