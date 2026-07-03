import { useState } from 'react';

// Vitamin D unit conversions:
//   Dose:    IU  ↔  µg  (1 µg = 40 IU)
//   Serum:   ng/mL ↔ nmol/L (1 ng/mL = 2.5 nmol/L)

type Mode = 'dose' | 'serum';

export default function UnitConverter() {
  const [mode, setMode] = useState<Mode>('dose');
  const [iu, setIu] = useState(1000);
  const [ug, setUg] = useState(25);
  const [ngml, setNgml] = useState(30);
  const [nmol, setNmol] = useState(75);

  const setIuBoth = (v: number) => { setIu(v); setUg(+(v / 40).toFixed(2)); };
  const setUgBoth = (v: number) => { setUg(v); setIu(Math.round(v * 40)); };
  const setNgBoth = (v: number) => { setNgml(v); setNmol(+(v * 2.5).toFixed(1)); };
  const setNmBoth = (v: number) => { setNmol(v); setNgml(+(v / 2.5).toFixed(1)); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Vitamin D Unit Converter
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Convert between International Units (IU) and micrograms (µg) for supplement doses, or
          between ng/mL and nmol/L for serum 25-hydroxyvitamin D lab results.
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('dose')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'dose'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
          }`}
        >
          Dose (IU ↔ µg)
        </button>
        <button
          onClick={() => setMode('serum')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'serum'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
          }`}
        >
          Serum (ng/mL ↔ nmol/L)
        </button>
      </div>

      {mode === 'dose' ? (
        <div className="grid grid-cols-2 gap-4">
          <Field label="IU (International Units)" hint="1 IU = 0.025 µg">
            <input
              type="number"
              min={0}
              value={iu}
              onChange={(e) => setIuBoth(+e.target.value || 0)}
              className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </Field>
          <Field label="µg (micrograms)" hint="1 µg = 40 IU">
            <input
              type="number"
              min={0}
              step={0.5}
              value={ug}
              onChange={(e) => setUgBoth(+e.target.value || 0)}
              className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="ng/mL" hint="US convention; 1 ng/mL = 2.5 nmol/L">
            <input
              type="number"
              min={0}
              value={ngml}
              onChange={(e) => setNgBoth(+e.target.value || 0)}
              className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </Field>
          <Field label="nmol/L" hint="EU/Canada/AU convention; 1 nmol/L = 0.4 ng/mL">
            <input
              type="number"
              min={0}
              step={0.1}
              value={nmol}
              onChange={(e) => setNmBoth(+e.target.value || 0)}
              className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </Field>
        </div>
      )}

      <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Common reference values</h2>
        {mode === 'dose' ? (
          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-1">IU</th>
                <th className="text-left py-1">µg</th>
                <th className="text-left py-1">Context</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {[
                [400, 10, 'AAP infant AI · IOM RDA under age 1'],
                [600, 15, 'IOM RDA ages 1–70'],
                [800, 20, 'IOM RDA ages 71+'],
                [1000, 25, 'Common OTC maintenance dose'],
                [2000, 50, 'Endocrine Society sufficiency dose'],
                [4000, 100, 'IOM Tolerable Upper Intake Level'],
                [50000, 1250, 'Clinical repletion single-dose'],
              ].map(([iu, ug, ctx]) => (
                <tr key={iu as number} className="border-t border-gray-200">
                  <td className="py-1.5 font-mono">{(iu as number).toLocaleString()}</td>
                  <td className="py-1.5 font-mono">{ug}</td>
                  <td className="py-1.5 text-gray-600">{ctx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-1">ng/mL</th>
                <th className="text-left py-1">nmol/L</th>
                <th className="text-left py-1">Interpretation</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {[
                [10, 25, 'Severe deficiency (rickets/osteomalacia risk)'],
                [12, 30, 'IOM lower cut-off'],
                [20, 50, 'IOM sufficiency threshold'],
                [30, 75, 'Endocrine Society sufficiency threshold'],
                [40, 100, 'Preferred by many clinicians'],
                [50, 125, 'Upper end of typical target'],
                [100, 250, 'Approaching potentially toxic range'],
                [150, 375, 'Toxicity increasingly likely'],
              ].map(([ng, nm, ctx]) => (
                <tr key={ng as number} className="border-t border-gray-200">
                  <td className="py-1.5 font-mono">{ng}</td>
                  <td className="py-1.5 font-mono">{nm}</td>
                  <td className="py-1.5 text-gray-600">{ctx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
