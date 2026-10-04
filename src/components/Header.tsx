import { Newspaper } from 'lucide-react';
import { categoryLabels } from '@/lib/supabase';

type Props = {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
};

const categories = Object.entries(categoryLabels);

export default function Header({ activeCategory, onCategoryChange }: Props) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            DuyTan<span className="text-orange-500">.</span>News
          </span>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => onCategoryChange(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          {categories.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile category scroll */}
      <div className="flex gap-1 overflow-x-auto px-6 pb-2 md:hidden">
        <button
          onClick={() => onCategoryChange(null)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            activeCategory === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Tất cả
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              activeCategory === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
