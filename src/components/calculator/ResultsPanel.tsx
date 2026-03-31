import type { CalculatorResult } from '../../lib/types';
import MonthlyChart from './MonthlyChart';

interface Props {
  result: CalculatorResult | null;
}

function UVGauge({ uvi }: { uvi: number }) {
  const getColor = (val: number) => {
    if (val <= 2) return { bg: 'bg-green-500', label: 'Low', text: 'text-green-700' };
    if (val <= 5) return { bg: 'bg-yellow-400', label: 'Moderate', text: 'text-yellow-700' };
    if (val <= 7) return { bg: 'bg-orange-500', label: 'High', text: 'text-orange-700' };
    if (val <= 10) return { bg: 'bg-red-500', label: 'Very High', text: 'text-red-700' };
    return { bg: 'bg-purple-600', label: 'Extreme', text: 'text-purple-700' };
  };

  const info = getColor(uvi);
  const pct = Math.min(100, (uvi / 14) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>UV Index</span>
        <span className={`font-semibold ${info.text}`}>{info.label}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${info.bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-lg font-bold mt-1">{uvi}</div>
    </div>
  );
}

export default function ResultsPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        <div className="text-5xl mb-4">&#9728;</div>
        <p className="text-lg font-medium">Configure your details above</p>
        <p className="text-sm">Results will appear here as you adjust the inputs</p>
      </div>
    );
  }

  const { dailySunVitaminD_IU, recommendedIntake_IU, supplementNeeded_IU, peakUVIndex, effectiveUVIndex, timeToOneMED_minutes, safeExposureTime_minutes, monthlyProduction } = result;

  return (
    <div className="space-y-6">
      {/* Main result */}
      <div className="bg-gradient-to-br from-sunshine-50 to-orange-50 rounded-2xl shadow-sm border border-sunshine-200 p-6">
        <h2 className="text-sm font-medium text-sunshine-700 uppercase tracking-wider mb-2">
          Your Daily Vitamin D Supplement
        </h2>
        <div className="text-5xl font-extrabold text-sunshine-600 mb-1">
          {supplementNeeded_IU.toLocaleString()} <span className="text-2xl font-semibold">IU</span>
        </div>
        <p className="text-sm text-gray-600">
          recommended daily supplementation
        </p>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">From Sun Exposure</p>
          <p className="text-2xl font-bold text-sky-600">{dailySunVitaminD_IU.toLocaleString()} <span className="text-sm font-normal">IU/day</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Recommended Total</p>
          <p className="text-2xl font-bold text-gray-800">{recommendedIntake_IU.toLocaleString()} <span className="text-sm font-normal">IU/day</span></p>
        </div>
      </div>

      {/* UV and exposure info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <UVGauge uvi={peakUVIndex} />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Effective UV (with adjustments)</p>
            <p className="font-semibold">{effectiveUVIndex}</p>
          </div>
          <div>
            <p className="text-gray-500">Time to Sunburn (1 MED)</p>
            <p className="font-semibold">
              {timeToOneMED_minutes === Infinity ? 'N/A' : `${timeToOneMED_minutes} min`}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Safe Unprotected Exposure</p>
            <p className="font-semibold text-green-600">
              {safeExposureTime_minutes === Infinity ? 'N/A' : `${safeExposureTime_minutes} min`}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Vitamin D Production & Supplement Needs</h3>
        <MonthlyChart data={monthlyProduction} recommended={recommendedIntake_IU} />
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        <p className="font-semibold mb-1">Medical Disclaimer</p>
        <p>
          This calculator provides estimates based on published scientific models and should not
          replace medical advice. Individual vitamin D synthesis varies significantly. Consult your
          healthcare provider and consider blood testing (serum 25-hydroxyvitamin D) for personalized
          recommendations. See our methodology page for full citations.
        </p>
      </div>
    </div>
  );
}
