import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import type { MonthlyData } from '../../lib/types';

interface Props {
  data: MonthlyData[];
  recommended: number;
}

export default function MonthlyChart({ data, recommended }: Props) {
  const chartData = data.map(d => ({
    name: d.monthName.substring(0, 3),
    'From Sun': d.vitaminD_IU,
    'Supplement Needed': d.supplementNeeded_IU,
    'UV Index': d.uvIndex,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()} IU`, name]}
          />
          <ReferenceLine
            y={recommended}
            stroke="#6366f1"
            strokeDasharray="5 5"
            label={{ value: `Target: ${recommended} IU`, position: 'insideTopRight', fontSize: 10, fill: '#6366f1' }}
          />
          <Bar dataKey="From Sun" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Supplement Needed" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
