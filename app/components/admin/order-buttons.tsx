// app/components/admin/order-buttons.tsx
import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '~/components/ui/button';

export function OrderButtons({ index, total, onMove }: { index: number; total: number; onMove: (dir: 'up' | 'down') => void }) {
  return (
    <div className="flex">
      <Button variant="ghost" size="icon-xs" aria-label="Naikkan" disabled={index === 0} onClick={() => onMove('up')}>
        <ArrowUp />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Turunkan" disabled={index === total - 1} onClick={() => onMove('down')}>
        <ArrowDown />
      </Button>
    </div>
  );
}
