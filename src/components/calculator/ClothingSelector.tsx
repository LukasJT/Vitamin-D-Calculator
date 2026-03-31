/**
 * Clothing / exposed skin selector.
 *
 * Body surface area fractions based on the "Rule of Nines" used in
 * burn assessment (Wallace, A.B. (1951). "The exposure treatment of burns."
 * The Lancet, 257(6653), 501-504.)
 *
 * Approximate exposed skin fractions for common clothing configurations:
 * - Face + hands only: ~10% BSA
 * - Short sleeves + shorts: ~40% BSA
 * - T-shirt + long pants: ~25% BSA
 * - Swimwear: ~80% BSA
 */

interface Props {
  value: number; // 0-1
  onChange: (fraction: number) => void;
}

const PRESETS = [
  { label: 'Winter (face + hands)', fraction: 0.10, icon: '🧥' },
  { label: 'Long sleeves + pants', fraction: 0.15, icon: '👔' },
  { label: 'T-shirt + long pants', fraction: 0.25, icon: '👕' },
  { label: 'Short sleeves + shorts', fraction: 0.40, icon: '🩳' },
  { label: 'Tank top + shorts', fraction: 0.55, icon: '🎽' },
  { label: 'Swimwear', fraction: 0.80, icon: '👙' },
];

export default function ClothingSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Clothing / Exposed Skin
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(({ label, fraction, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(fraction)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              Math.abs(value - fraction) < 0.01
                ? 'border-sunshine-500 bg-sunshine-50 text-sunshine-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {Math.round(value * 100)}% of body exposed to sun
      </p>
    </div>
  );
}
