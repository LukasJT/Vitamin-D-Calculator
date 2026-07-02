import { useMemo, useState } from 'react';

interface Interpretation {
  status: 'severely_deficient' | 'deficient' | 'insufficient' | 'sufficient' | 'optimal_upper' | 'high' | 'potentially_toxic';
  label: string;
  color: string;
  headline: string;
  body: string;
  action: string;
}

const NG_ML_TO_NMOL_L = 2.5;

function interpret(ngml: number): Interpretation {
  if (ngml < 12) return {
    status: 'severely_deficient',
    label: 'Severely deficient',
    color: 'bg-red-600',
    headline: 'Severely deficient serum 25(OH)D',
    body:
      'A serum 25-hydroxyvitamin D below 12 ng/mL (30 nmol/L) is the threshold at which osteomalacia and rickets become clinically likely. Secondary hyperparathyroidism, hypocalcaemia, and impaired bone mineralisation are commonly present at this level.',
    action:
      'Consult a physician promptly. Repletion regimens typically use 50,000 IU cholecalciferol weekly for 8 weeks, followed by 1,500–2,000 IU/day maintenance (Endocrine Society 2011).',
  };
  if (ngml < 20) return {
    status: 'deficient',
    label: 'Deficient',
    color: 'bg-orange-500',
    headline: 'Deficient by IOM criteria',
    body:
      'A serum 25(OH)D between 12 and 20 ng/mL (30–50 nmol/L) is defined as deficient by the Institute of Medicine (2011). Bone health is at risk; parathyroid hormone is likely elevated to compensate.',
    action:
      'Discuss with your physician. Typical loading regimen: 6,000 IU/day cholecalciferol for 8 weeks, then 1,500–2,000 IU/day maintenance. Recheck 25(OH)D after 3 months.',
  };
  if (ngml < 30) return {
    status: 'insufficient',
    label: 'Insufficient',
    color: 'bg-amber-500',
    headline: 'Insufficient by Endocrine Society criteria',
    body:
      'A serum 25(OH)D between 20 and 30 ng/mL (50–75 nmol/L) meets the IOM sufficiency threshold but falls below the Endocrine Society insufficiency threshold. Musculoskeletal and immune outcomes may not be fully optimised.',
    action:
      'Consider daily supplementation of 1,000–2,000 IU cholecalciferol and re-testing in 3 months. Increase sun exposure during the UVB season, subject to skin cancer risk considerations.',
  };
  if (ngml < 50) return {
    status: 'sufficient',
    label: 'Sufficient',
    color: 'bg-emerald-500',
    headline: 'Sufficient by all major guidelines',
    body:
      'A serum 25(OH)D between 30 and 50 ng/mL (75–125 nmol/L) is considered sufficient for musculoskeletal health by both the IOM and the Endocrine Society, and is the target range for most healthy adults.',
    action:
      'No change indicated. Maintain your current sun exposure and supplementation routine. Consider seasonal re-testing at the end of winter to catch any winter decline.',
  };
  if (ngml < 80) return {
    status: 'optimal_upper',
    label: 'Optimal-upper',
    color: 'bg-teal-500',
    headline: 'Upper end of the optimal range',
    body:
      'A serum 25(OH)D between 50 and 80 ng/mL (125–200 nmol/L) is above the standard sufficiency target but still safely below toxicity thresholds. Some studies suggest additional benefit at these levels; others show no incremental benefit.',
    action:
      'No urgent change. If you supplement, consider reducing the dose to prevent further increases. Retest in 3–6 months.',
  };
  if (ngml < 100) return {
    status: 'high',
    label: 'High',
    color: 'bg-yellow-500',
    headline: 'High serum 25(OH)D',
    body:
      'A serum 25(OH)D between 80 and 100 ng/mL (200–250 nmol/L) is beyond the range that most guidelines target. Hypercalcaemia is uncommon at this level but the safety margin narrows.',
    action:
      'Reduce or discontinue vitamin D supplementation and retest in 8–12 weeks. Rule out excessive dosing errors.',
  };
  return {
    status: 'potentially_toxic',
    label: 'Potentially toxic',
    color: 'bg-red-700',
    headline: 'Above the safe upper reference range',
    body:
      'A serum 25(OH)D above 100 ng/mL (250 nmol/L) is above the safe upper reference. Sustained levels above 150 ng/mL (375 nmol/L) are associated with hypercalcaemia, hypercalciuria, nephrocalcinosis, and vitamin D intoxication.',
    action:
      'Stop all vitamin D supplementation immediately. Contact your physician for assessment of calcium, phosphorus, and renal function, and to plan monitoring.',
  };
}

export default function BloodTestInterpreter() {
  const [unit, setUnit] = useState<'ng/mL' | 'nmol/L'>('ng/mL');
  const [value, setValue] = useState(32);

  const ngml = unit === 'ng/mL' ? value : value / NG_ML_TO_NMOL_L;
  const nmol = unit === 'nmol/L' ? value : value * NG_ML_TO_NMOL_L;
  const info = useMemo(() => interpret(ngml), [ngml]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Vitamin D Blood Test Result Interpreter
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Enter your <span className="italic">serum 25-hydroxyvitamin D</span> &#91;25(OH)D&#93;
          result and get an evidence-based interpretation against the IOM and Endocrine Society
          reference ranges. Educational only — not medical advice.
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4">
        <div className="flex gap-2">
          {(['ng/mL', 'nmol/L'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                unit === u
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serum 25(OH)D result ({unit})
          </label>
          <input
            type="number"
            min={0}
            max={unit === 'ng/mL' ? 250 : 625}
            step={unit === 'ng/mL' ? 1 : 2}
            value={value}
            onChange={(e) => setValue(+e.target.value || 0)}
            className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <p className="text-sm text-gray-500 mt-2">
            = {ngml.toFixed(1)} ng/mL · {nmol.toFixed(1)} nmol/L
          </p>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 shadow-sm mb-6 bg-white`}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">{info.headline}</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${info.color}`}>
            {info.label}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">{info.body}</p>
        <div className="bg-gray-50 border-l-4 border-amber-500 px-4 py-3 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-1">Suggested action</p>
          <p className="text-sm text-gray-700 leading-relaxed">{info.action}</p>
        </div>
      </div>

      <ReferenceRanges highlightNg={ngml} />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 mt-6 leading-relaxed">
        <p className="font-semibold mb-1">Not medical advice</p>
        <p>
          Serum 25(OH)D thresholds are guidelines derived from population studies. Individual
          management depends on symptoms, comorbidities, medications, and other laboratory values
          (calcium, phosphorus, PTH, creatinine). Always discuss results with your healthcare provider.
        </p>
      </div>
    </div>
  );
}

function ReferenceRanges({ highlightNg }: { highlightNg: number }) {
  const rows = [
    { min: 0, max: 12, label: 'Severe deficiency', color: 'bg-red-100 border-red-300' },
    { min: 12, max: 20, label: 'Deficient (IOM)', color: 'bg-orange-100 border-orange-300' },
    { min: 20, max: 30, label: 'Insufficient (Endocrine Society)', color: 'bg-amber-100 border-amber-300' },
    { min: 30, max: 50, label: 'Sufficient — target range', color: 'bg-emerald-100 border-emerald-300' },
    { min: 50, max: 80, label: 'Upper optimal', color: 'bg-teal-100 border-teal-300' },
    { min: 80, max: 100, label: 'High', color: 'bg-yellow-100 border-yellow-300' },
    { min: 100, max: 999, label: 'Potentially toxic', color: 'bg-red-200 border-red-400' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Reference ranges</h3>
      <div className="space-y-2">
        {rows.map((r) => {
          const active = highlightNg >= r.min && highlightNg < r.max;
          return (
            <div
              key={r.label}
              className={`flex items-baseline justify-between border rounded-lg px-3 py-2 ${r.color} ${
                active ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-800">{r.label}</span>
              <span className="text-xs text-gray-600 font-mono">
                {r.min}–{r.max === 999 ? '∞' : r.max} ng/mL · {r.min * 2.5}–
                {r.max === 999 ? '∞' : r.max * 2.5} nmol/L
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
