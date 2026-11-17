// app/routes/admin/media.tsx
import { ImageIcon, Pencil, Play, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';

import { useImageUpload } from '~/components/admin/use-image-upload';
import { CldImage } from '~/components/cld-image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Progress } from '~/components/ui/progress';
import { ACCEPT_MEDIA, mediaApi } from '~/lib/image.client';
import type { MediaListItem } from '~/schemas/media';
import { listMedia, mediaCount } from '~/services/media.server';
import type { Route } from './+types/media';

const PAGE = 24;

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Media | Admin Yohara Gemilang' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const take = Math.min(Math.max(Number(url.searchParams.get('take')) || PAGE, PAGE), 240);
  const [{ items, nextCursor }, total] = await Promise.all([listMedia({ take }), mediaCount()]);
  return { items, hasMore: nextCursor !== null, total, take };
}

function kb(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminMedia({ loaderData }: Route.ComponentProps) {
  const { items, hasMore, total, take } = loaderData;
  const { revalidate } = useRevalidator();
  const inputRef = useRef<HTMLInputElement>(null);
  const [allowAny, setAllowAny] = useState(false);
  const { busy, percent, current, total: batch, upload } = useImageUpload(allowAny ? 'any' : 'landscape', true);

  const [editing, setEditing] = useState<MediaListItem | null>(null);
  const [alt, setAlt] = useState('');
  const [deleting, setDeleting] = useState<MediaListItem | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (inputRef.current) inputRef.current.value = '';
    const done = await upload(list);
    if (done.length) {
      toast.success(`${done.length} gambar berhasil diunggah`);
      revalidate();
    }
  }

  async function saveAlt() {
    if (!editing) return;
    setSaving(true);
    try {
      await mediaApi.updateAlt(editing.id, alt.trim());
      toast.success('Teks alternatif disimpan');
      setEditing(null);
      revalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await mediaApi.remove(deleting.id);
      toast.success('Gambar dihapus');
      revalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} file. Gambar diubah ke WebP otomatis. Video maksimal 15 MB dan 20 detik. Bawaan hanya menerima landscape, ideal 16:9.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="allow-any" checked={allowAny} onCheckedChange={setAllowAny} />
            <Label htmlFor="allow-any" className="text-sm font-normal">
              Izinkan potret dan persegi (logo, foto orang)
            </Label>
          </div>
          <input ref={inputRef} type="file" multiple accept={ACCEPT_MEDIA} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <Button disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload />
            Unggah gambar
          </Button>
        </div>
      </div>

      {busy ? (
        <div className="max-w-md space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Mengunggah {current} dari {batch}
          </p>
          <Progress value={percent} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>Belum ada file</EmptyTitle>
            <EmptyDescription>Unggah gambar (JPG, PNG, WebP, GIF, SVG, maksimal 10 MB) atau video (MP4, WebM, maksimal 15 MB).</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <Card key={m.id} size="sm" className="overflow-hidden pt-0">
              <div className="aspect-square bg-muted">
                <CldImage media={m} aspect={1} widths={[160, 320, 480]} sizes="(min-width: 1024px) 240px, 45vw" className="size-full object-cover" />
              </div>
              <CardContent className="space-y-1">
                <p className="truncate text-sm font-medium" title={m.alt || m.publicId}>
                  {m.alt || 'Tanpa teks alternatif'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.width}×{m.height} · {kb(m.bytes)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {m.kind === 'VIDEO' ? (
                    <Badge variant="secondary">
                      <Play />
                      Video · {Math.round(m.duration ?? 0)} dtk
                    </Badge>
                  ) : null}
                  <Badge variant={m.usage > 0 ? 'secondary' : 'outline'}>{m.usage > 0 ? `Dipakai ${m.usage}` : 'Tidak dipakai'}</Badge>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(m);
                    setAlt(m.alt);
                  }}
                >
                  <Pencil />
                  Alt
                </Button>
                <Button variant="outline" size="sm" disabled={m.usage > 0} title={m.usage > 0 ? 'Masih dipakai, tidak bisa dihapus' : undefined} onClick={() => setDeleting(m)}>
                  <Trash2 />
                  Hapus
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" render={<a href={`?take=${take + PAGE}`} />}>
            Muat lainnya
          </Button>
        </div>
      ) : null}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teks alternatif</DialogTitle>
            <DialogDescription>Deskripsi singkat gambar untuk pembaca layar dan mesin pencari.</DialogDescription>
          </DialogHeader>
          <Input value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveAlt()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button disabled={saving} onClick={saveAlt}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus gambar ini?</AlertDialogTitle>
            <AlertDialogDescription>File akan dihapus permanen dari Cloudinary dan tidak bisa dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
