// app/components/public/articles/article-filter.tsx
// Filter kategori berupa tautan (?kategori=...), jadi bisa dibagikan dan bekerja tanpa JavaScript.
import { Link } from 'react-router';

import { cn } from '~/lib/utils';

const chip = 'rounded-md border px-4 py-2 text-[0.88rem] font-medium transition-colors';

export function ArticleFilter({ categories, active }: { categories: string[]; active: string | null }) {
  if (categories.length === 0) return null;
  const items = [{ key: '', label: 'Semua', to: '/artikel' }].concat(categories.map((c) => ({ key: c, label: c, to: `/artikel?kategori=${encodeURIComponent(c)}` })));
  return (
    <nav aria-label="Filter kategori" className="flex flex-wrap gap-2">
      {items.map((f) => {
        const on = (active ?? '') === f.key;
        return (
          <Link key={f.key || 'all'} to={f.to} aria-current={on ? 'true' : undefined} className={cn(chip, on ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink')}>
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
