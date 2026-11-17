// app/components/admin/gallery-field.tsx
import { ArrowLeft, ArrowRight, Library, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { CldImage } from '~/components/cld-image';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Progress } from '~/components/ui/progress';
import { LANDSCAPE_HINT, type Orientation } from '~/lib/image-rules';
import { ACCEPT } from '~/lib/image.client';
import type { MediaItem } from '~/schemas/media';
import { MediaPicker } from './media-picker';
import { useImageUpload } from './use-image-upload';

/**
 * Beberapa gambar dengan urutan. Mengirim <input type="hidden" name={name}>
 * satu per gambar, urut. Baca dengan formData.getAll(name).
 */
export function GalleryField({
  name,
  label,
  description,
  value,
  onChange,
  max = 20,
  orientation = 'landscape',
  error,
}: {
  name: string;
  label: string;
  description?: string;
  value: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  max?: number;
  orientation?: Orientation;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { busy, percent, current, total, upload } = useImageUpload(orientation);
  const room = max - value.length;

  function add(items: MediaItem[]) {
    const ids = new Set(value.map((v) => v.id));
    const fresh = items.filter((i) => !ids.has(i.id)).slice(0, Math.max(room, 0));
    if (fresh.length) onChange([...value, ...fresh]);
  }

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []).slice(0, Math.max(room, 0));
    if (inputRef.current) inputRef.current.value = '';
    add(await upload(list));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel>
        {label} ({value.length}/{max})
      </FieldLabel>
      <FieldDescription>{[description, orientation === 'landscape' ? LANDSCAPE_HINT : null].filter(Boolean).join('. ')}</FieldDescription>

      {value.map((m) => (
        <input key={m.id} type="hidden" name={name} value={m.id} />
      ))}

      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((m, i) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
              <CldImage media={m} aspect={1} widths={[160, 320]} sizes="200px" className="size-full object-cover" />
              <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 text-xs font-medium">{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-background/90 p-1">
                <div className="flex">
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Geser ke depan" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowLeft />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Geser ke belakang" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                    <ArrowRight />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Lepas gambar" onClick={() => onChange(value.filter((v) => v.id !== m.id))}>
                  <X />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {busy ? (
        <div className="max-w-md space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Mengunggah {current} dari {total}
          </p>
          <Progress value={percent} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Button type="button" variant="outline" size="sm" disabled={busy || room <= 0} onClick={() => inputRef.current?.click()}>
          <Upload />
          Unggah
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy || room <= 0} onClick={() => setPickerOpen(true)}>
          <Library />
          Perpustakaan
        </Button>
      </div>

      {error ? <FieldError>{error}</FieldError> : null}

      <MediaPicker multiple orientation={orientation} open={pickerOpen} onOpenChange={setPickerOpen} onSelect={add} />
    </Field>
  );
}
