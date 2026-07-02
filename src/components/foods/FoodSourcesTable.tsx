import { useMemo, useState } from 'react';
import foods from '../../data/vitamin-d-foods.json';

type Food = { name: string; category: string; serving: string; iu: number; mcg: number };
type SortKey = 'name' | 'iu' | 'category';

export default function FoodSourcesTable() {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('iu');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>((foods as Food[]).map((f) => f.category));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let out = foods as Food[];
    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter((f) => f.name.toLowerCase().includes(qq) || f.category.toLowerCase().includes(qq));
    }
    if (category !== 'all') out = out.filter((f) => f.category === category);
    if (sortKey === 'iu') out = [...out].sort((a, b) => b.iu - a.iu);
    else if (sortKey === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else out = [...out].sort((a, b) => a.category.localeCompare(b.category) || b.iu - a.iu);
    return out;
  }, [q, sortKey, category]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search foods…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500"
        >
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500"
        >
          <option value="iu">Sort: Vitamin D (high → low)</option>
          <option value="name">Sort: Name (A → Z)</option>
          <option value="category">Sort: Category</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Food</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-semibold">Serving</th>
              <th className="text-right px-4 py-3 font-semibold">IU</th>
              <th className="text-right px-4 py-3 font-semibold">µg</th>
              <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">% RDA (600 IU)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const pct = Math.round((f.iu / 600) * 100);
              return (
                <tr key={f.name} className="border-b border-gray-100 last:border-b-0 hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{f.category}</td>
                  <td className="px-4 py-3 text-gray-600">{f.serving}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">{f.iu.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{f.mcg.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-mono hidden md:table-cell">
                    <span className={pct >= 100 ? 'text-emerald-700 font-semibold' : pct >= 25 ? 'text-amber-700' : 'text-gray-500'}>
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No foods match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Values are typical means from the USDA FoodData Central database; individual products vary,
        especially fortified items. RDA (600 IU/day) is the IOM recommendation for adults 19–70;
        older adults require 800 IU/day.
      </p>
    </div>
  );
}
