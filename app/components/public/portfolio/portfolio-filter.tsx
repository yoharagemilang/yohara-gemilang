// app/components/public/portfolio/portfolio-filter.tsx
// Filter jenis layanan berupa tautan (?layanan=...), jadi bisa dibagikan dan bekerja tanpa JavaScript.
import { Link } from 'react-router';

import { cn } from '~/lib/utils';

const chip = 'rounded-md border px-4 py-2 text-[0.88rem] font-medium transition-colors';

export function PortfolioFilter({ filters, activeId }: { filters: { id: string; title: string }[]; activeId: string | null }) {
  if (filters.length === 0) return null;
  const items = [{ id: '', title: 'Semua', to: '/portofolio' }].concat(filters.map((f) => ({ id: f.id, title: f.title, to: `/portofolio?layanan=${encodeURIComponent(f.id)}` })));
  return (
    <nav aria-label="Filter layanan" className="flex flex-wrap gap-2">
      {items.map((f) => {
        const active = (activeId ?? '') === f.id;
        return (
          <Link key={f.id || 'all'} to={f.to} aria-current={active ? 'true' : undefined} className={cn(chip, active ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink')}>
            {f.title}
          </Link>
        );
      })}
    </nav>
  );
}
