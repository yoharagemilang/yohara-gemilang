// app/components/admin/sortable-table.tsx
// Urutan baris tabel lewat seret-dan-lepas, dengan tampilan yang berubah seketika. Penyimpanan berjalan di belakang.
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { TableBody, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils';

const lockX: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Urutan lokal yang langsung tampil. Dibuang saat data dari server datang atau penyimpanan gagal. */
export function useOptimisticOrder<T extends { id: string }>(items: T[], save: (ids: string[]) => void, failed: boolean) {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => setIds(null), [items]);
  useEffect(() => {
    if (failed) setIds(null);
  }, [failed]);

  const ordered = useMemo(() => {
    if (!ids || ids.length !== items.length) return items;
    const byId = new Map(items.map((i) => [i.id, i]));
    const list = ids.map((id) => byId.get(id));
    return list.every(Boolean) ? (list as T[]) : items;
  }, [ids, items]);

  const reorder = (next: string[]) => {
    setIds(next);
    save(next);
  };

  const move = (id: string, dir: 'up' | 'down') => {
    const current = ordered.map((i) => i.id);
    const from = current.indexOf(id);
    const to = dir === 'up' ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= current.length) return;
    reorder(arrayMove(current, from, to));
  };

  return { ordered, reorder, move };
}

export function SortableBody({ ids, onReorder, children }: { ids: string[]; onReorder: (ids: string[]) => void; children: ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };

  return (
    <DndContext
      id={useId()}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[lockX]}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: 'Tekan spasi untuk mengangkat baris, panah atas dan bawah untuk memindahkan, spasi lagi untuk meletakkan, Escape untuk membatalkan.',
        },
        announcements: {
          onDragStart: () => 'Baris diangkat.',
          onDragOver: ({ over }) => (over ? `Baris berada di posisi ${ids.indexOf(String(over.id)) + 1}.` : undefined),
          onDragEnd: ({ over }) => (over ? `Baris diletakkan di posisi ${ids.indexOf(String(over.id)) + 1}.` : 'Baris dikembalikan.'),
          onDragCancel: () => 'Pemindahan dibatalkan.',
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <TableBody>{children}</TableBody>
      </SortableContext>
    </DndContext>
  );
}

type HandleProps = Pick<ReturnType<typeof useSortable>, 'attributes' | 'listeners' | 'setActivatorNodeRef'>;
const HandleContext = createContext<HandleProps | null>(null);

export function SortableRow({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <HandleContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
      <TableRow ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && 'relative z-10 bg-background shadow-lg', className)}>
        {children}
      </TableRow>
    </HandleContext.Provider>
  );
}

export function DragHandle({ label }: { label: string }) {
  const ctx = useContext(HandleContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      ref={ctx.setActivatorNodeRef}
      {...ctx.attributes}
      {...ctx.listeners}
      aria-label={`Seret untuk memindahkan ${label}`}
      className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  );
}
