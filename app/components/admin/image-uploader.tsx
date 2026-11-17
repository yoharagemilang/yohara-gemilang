// app/components/admin/image-uploader.tsx
import { ImageIcon, Library, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { CldImage } from '~/components/cld-image';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Progress } from '~/components/ui/progress';
import { LANDSCAPE_HINT, type Orientation } from '~/lib/image-rules';
import { ACCEPT, mediaApi } from '~/lib/image.client';
import type { MediaItem } from '~/schemas/media';
import { MediaPicker } from './media-picker';
import { useImageUpload } from './use-image-upload';

/**
 * Satu gambar. Menaruh <input type="hidden" name={name}> berisi id media,
 * jadi bisa dipakai langsung di dalam <Form>.
 */
export function ImageUploader({
  name,
  label,
  description,
  value,
  onChange,
  aspect = 16 / 9,
  fit = 'cover',
  orientation = 'landscape',
  error,
}: {
  name: string;
  label: string;
  description?: string;
  value: MediaItem | null;
  onChange: (value: MediaItem | null) => void;
  /** Rasio kotak pratinjau (lebar / tinggi) */
  aspect?: number;
  /** contain dipakai untuk logo supaya tidak terpotong */
  fit?: 'cover' | 'contain';
  /** landscape (bawaan) menolak gambar potret. Pakai "any" untuk logo dan foto orang. */
  orientation?: Orientation;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { busy, percent, upload } = useImageUpload(orientation);

  async function handleFiles(files: FileList | null) {
    const [file] = Array.from(files ?? []);
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    const [media] = await upload([file]);
    if (media) onChange(media);
  }

  async function saveAlt(alt: string) {
    if (!value || alt === value.alt) return;
    try {
      await mediaApi.updateAlt(value.id, alt);
      onChange({ ...value, alt });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan teks alternatif');
    }
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{[description, orientation === 'landscape' ? LANDSCAPE_HINT : null].filter(Boolean).join('. ')}</FieldDescription>

      <input type="hidden" name={name} value={value?.id ?? ''} />

      <div className="relative w-full max-w-md overflow-hidden rounded-lg border bg-muted" style={{ aspectRatio: String(aspect) }}>
        {value ? (
          <CldImage media={value} sizes="448px" widths={[320, 640, 960]} className={`size-full ${fit === 'contain' ? 'object-contain p-4' : 'object-cover'}`} />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        {busy ? (
          <div className="absolute inset-x-0 bottom-0 bg-background/90 p-3">
            <Progress value={percent} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload />
          {value ? 'Ganti' : 'Unggah'}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setPickerOpen(true)}>
          <Library />
          Perpustakaan
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => onChange(null)}>
            <Trash2 />
            Lepas
          </Button>
        ) : null}
      </div>

      {value ? <Input key={value.id} defaultValue={value.alt} placeholder="Teks alternatif (deskripsi singkat gambar)" maxLength={200} onBlur={(e) => saveAlt(e.target.value.trim())} className="max-w-md" /> : null}

      {error ? <FieldError>{error}</FieldError> : null}

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} orientation={orientation} onSelect={([item]) => item && onChange(item)} />
    </Field>
  );
}
