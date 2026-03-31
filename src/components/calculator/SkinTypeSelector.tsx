import { useState } from 'react';
import type { FitzpatrickType } from '../../lib/types';

/**
 * Visual Fitzpatrick skin type selector.
 *
 * Based on: Fitzpatrick, T.B. (1988). "The validity and practicality of
 * sun-reactive skin types I through VI." Archives of Dermatology, 124(6), 869-871.
 */

interface Props {
  value: FitzpatrickType;
  onChange: (type: FitzpatrickType) => void;
}

const SKIN_TYPES: { type: FitzpatrickType; color: string; label: string; description: string }[] = [
  { type: 1, color: '#FDEBD0', label: 'Type I', description: 'Very fair — always burns, never tans' },
  { type: 2, color: '#F5CBA7', label: 'Type II', description: 'Fair — burns easily, tans minimally' },
  { type: 3, color: '#E0AC69', label: 'Type III', description: 'Medium — burns moderately, tans gradually' },
  { type: 4, color: '#C68642', label: 'Type IV', description: 'Olive — burns minimally, tans well' },
  { type: 5, color: '#8D5524', label: 'Type V', description: 'Brown — rarely burns, tans profusely' },
  { type: 6, color: '#4A2912', label: 'Type VI', description: 'Dark brown/black — never burns' },
];

export default function SkinTypeSelector({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<FitzpatrickType | null>(null);

  const displayType = hovered ?? value;
  const displayInfo = SKIN_TYPES.find(s => s.type === displayType)!;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Skin Type (Fitzpatrick Scale)
      </label>
      <div className="flex gap-2 mb-2">
        {SKIN_TYPES.map(({ type, color }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            onMouseEnter={() => setHovered(type)}
            onMouseLeave={() => setHovered(null)}
            className={`w-10 h-10 rounded-full border-3 transition-all cursor-pointer ${
              value === type
                ? 'border-sunshine-500 scale-110 shadow-md'
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Skin type ${type}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        <span className="font-medium">{displayInfo.label}:</span> {displayInfo.description}
      </p>
    </div>
  );
}
