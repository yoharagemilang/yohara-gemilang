// app/components/admin/media-picker.tsx
import { Check, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CldImage } from '~/components/cld-image';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { LANDSCAPE_HINT, isLandscape, type Orientation } from '~/lib/image-rules';
import { mediaApi } from '~/lib/image.client';
import type { MediaItem } from '~/schemas/media';

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  orientation = 'landscape',
  allowVideo = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  orientation?: Orientation;
  /** Tampilkan juga video. Bawaan: hanya gambar. */
  allowVideo?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<MediaItem[]>([]);

  const load = useCallback(
    async (q: string, after: string | null) => {
      setLoading(true);
      try {
        const res = await mediaApi.list({
          q,
          cursor: after,
          take: 24,
          kind: allowVideo ? undefined : 'IMAGE',
        });
        setItems((prev) => (after ? [...prev, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Gagal memuat gambar');
      } finally {
        setLoading(false);
      }
    },
    [allowVideo],
  );

  // Muat ulang saat dibuka dan saat pencarian berubah (jeda 300 ms)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(query.trim(), null), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, query, load]);

  useEffect(() => {
    if (!open) {
      setPicked([]);
      setQuery('');
    }
  }, [open]);

  function toggle(item: MediaItem) {
    setPicked((prev) => {
      const has = prev.some((p) => p.id === item.id);
      if (has) return prev.filter((p) => p.id !== item.id);
      return multiple ? [...prev, item] : [item];
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Perpustakaan media</DialogTitle>
          <DialogDescription>
            {multiple ? 'Pilih satu atau lebih gambar.' : 'Pilih satu gambar.'}
            {orientation === 'landscape' ? ` ${LANDSCAPE_HINT}.` : ''}
          </DialogDescription>
        </DialogHeader>

        <Input placeholder="Cari berdasarkan teks alternatif" value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="max-h-[50vh] overflow-y-auto">
          {items.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Belum ada gambar.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((item) => {
                const selected = picked.some((p) => p.id === item.id);
                const blocked = orientation === 'landscape' && !isLandscape(item.width, item.height);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={blocked}
                    title={blocked ? 'Bukan gambar landscape' : undefined}
                    onClick={() => toggle(item)}
                    aria-pressed={selected}
                    className={`relative aspect-square overflow-hidden rounded-md border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected ? 'ring-2 ring-primary' : ''
                    } ${blocked ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <CldImage media={item} aspect={1} widths={[160, 320]} sizes="160px" className="size-full object-cover" />
                    {item.kind === 'VIDEO' ? (
                      <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                        <Play className="size-3" />
                        {Math.round(item.duration ?? 0)} dtk
                      </span>
                    ) : null}
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : null}
          {cursor && !loading ? (
            <div className="flex justify-center pt-3">
              <Button variant="outline" size="sm" onClick={() => load(query.trim(), cursor)}>
                Muat lainnya
              </Button>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={picked.length === 0}
            onClick={() => {
              onSelect(picked);
              onOpenChange(false);
            }}
          >
            Pilih{picked.length > 0 ? ` (${picked.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
