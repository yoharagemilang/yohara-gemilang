// app/components/public/shared/pagination.tsx
// Penomoran halaman berupa tautan biasa (bekerja tanpa JavaScript, ramah mesin pencari).
import { Link } from 'react-router';

import { cn } from '~/lib/utils';

const base = 'grid h-10 min-w-10 place-items-center rounded-md border px-3 text-[0.9rem] font-medium transition-colors';

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <nav aria-label="Halaman" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link to={hrefFor(page - 1)} rel="prev" className={cn(base, 'border-line hover:border-ink')}>
          Sebelumnya
        </Link>
      ) : null}
      {numbers.map((n) => (
        <Link key={n} to={hrefFor(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Halaman ${n}`} className={cn(base, n === page ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink')}>
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link to={hrefFor(page + 1)} rel="next" className={cn(base, 'border-line hover:border-ink')}>
          Berikutnya
        </Link>
      ) : null}
    </nav>
  );
}
