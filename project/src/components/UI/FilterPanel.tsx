
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';

const categories = [
  { key: 'ai', label: 'AI Projects', color: '#06B6D4' },
  { key: 'quantum', label: 'Quantum Computing', color: '#8B5CF6' },
  { key: 'fullstack', label: 'Full-Stack', color: '#14B8A6' },
  { key: 'personal', label: 'About/Personal', color: '#F59E0B' },
];

export function FilterPanel() {
  const activeFilters = useAppStore((s) => s.activeFilters);
  const setActiveFilters = useAppStore((s) => s.setActiveFilters);
  const [open, setOpen] = useState(false);

  function toggleCategory(key: string) {
    if (activeFilters.includes(key)) {
      setActiveFilters(activeFilters.filter((k) => k !== key));
    } else {
      setActiveFilters([...activeFilters, key]);
    }
  }

  return (
    <div className="relative inline-block text-left z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
      >
        <span>Filter</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2">
          {categories.map((cat) => (
            <label
              key={cat.key}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-800"
              style={{ color: cat.color }}
            >
              <input
                type="checkbox"
                checked={activeFilters.includes(cat.key)}
                onChange={() => toggleCategory(cat.key)}
                className="mr-2 accent-cyan-400"
              />
              {cat.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}