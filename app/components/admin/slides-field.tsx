// app/components/admin/slides-field.tsx
import { ArrowDown, ArrowUp, Library, Play, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { CldImage } from '~/components/cld-image';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Progress } from '~/components/ui/progress';
import { MAX_HERO_SLIDES } from '~/lib/image-rules';
import { ACCEPT_MEDIA } from '~/lib/image.client';
import type { MediaItem } from '~/schemas/media';
import { MediaPicker } from './media-picker';
import { useImageUpload } from './use-image-upload';

export type Slide = {
  media: MediaItem;
  captionTitle: string;
  captionMeta: string;
};

/**
 * Daftar slide hero: gambar atau video, masing-masing dengan keterangan.
 * Mengirim satu <input type="hidden" name={name}> berisi JSON slide berurutan.
 */
export function SlidesField({ name, value, onChange, error }: { name: string; value: Slide[]; onChange: (value: Slide[]) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { busy, percent, current, total, upload } = useImageUpload('landscape', true);
  const room = MAX_HERO_SLIDES - value.length;
  const firstIsVideo = value[0]?.media.kind === 'VIDEO';

  function add(items: MediaItem[]) {
    const ids = new Set(value.map((v) => v.media.id));
    const fresh = items
      .filter((m) => !ids.has(m.id))
      .slice(0, Math.max(room, 0))
      .map((media) => ({ media, captionTitle: '', captionMeta: '' }));
    if (fresh.length) onChange([...value, ...fresh]);
  }

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []).slice(0, Math.max(room, 0));
    if (inputRef.current) inputRef.current.value = '';
    add(await upload(list));
  }

  function update(index: number, patch: Partial<Slide>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  const payload = JSON.stringify(
    value.map((s) => ({
      mediaId: s.media.id,
      captionTitle: s.captionTitle,
      captionMeta: s.captionMeta,
    })),
  );

  return (
    <Field data-invalid={error || firstIsVideo ? true : undefined}>
      <FieldLabel>
        Slide ({value.length}/{MAX_HERO_SLIDES})
      </FieldLabel>
      <FieldDescription>Gambar atau video, landscape, ideal 16:9. Video maksimal 15 MB dan 20 detik, tampil tanpa suara dan berulang. Slide pertama harus gambar supaya halaman cepat tampil.</FieldDescription>

      <input type="hidden" name={name} value={payload} />

      <div className="space-y-3">
        {value.map((slide, i) => (
          <Card key={slide.media.id} size="sm">
            <CardContent className="flex flex-col gap-4 sm:flex-row">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-52">
                <CldImage media={slide.media} aspect={16 / 9} widths={[208, 416]} sizes="208px" className="size-full object-cover" />
                {slide.media.kind === 'VIDEO' ? (
                  <Badge className="absolute bottom-1.5 left-1.5" variant="secondary">
                    <Play />
                    Video · {Math.round(slide.media.duration ?? 0)} dtk
                  </Badge>
                ) : null}
                <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 text-xs font-medium">{i + 1}</span>
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`cap-title-${i}`}>Keterangan: judul</FieldLabel>
                  <Input id={`cap-title-${i}`} value={slide.captionTitle} maxLength={80} placeholder="Gala Dinner 640 tamu" onChange={(e) => update(i, { captionTitle: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`cap-meta-${i}`}>Keterangan: info</FieldLabel>
                  <Input id={`cap-meta-${i}`} value={slide.captionMeta} maxLength={120} placeholder="Medan, Oktober 2026" onChange={(e) => update(i, { captionMeta: e.target.value })} />
                </Field>
              </div>

              <div className="flex shrink-0 gap-1 sm:flex-col">
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Naikkan slide ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Turunkan slide ${i + 1}`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Lepas slide ${i + 1}`} onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                  <X />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {busy ? (
        <div className="max-w-md space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Mengunggah {current} dari {total}
          </p>
          <Progress value={percent} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" multiple accept={ACCEPT_MEDIA} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Button type="button" variant="outline" size="sm" disabled={busy || room <= 0} onClick={() => inputRef.current?.click()}>
          <Upload />
          Unggah
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy || room <= 0} onClick={() => setPickerOpen(true)}>
          <Library />
          Perpustakaan
        </Button>
      </div>

      {firstIsVideo ? <FieldError>Slide pertama harus gambar. Geser sebuah gambar ke urutan pertama.</FieldError> : null}
      {error ? <FieldError>{error}</FieldError> : null}

      <MediaPicker multiple allowVideo open={pickerOpen} onOpenChange={setPickerOpen} onSelect={add} />
    </Field>
  );
}
