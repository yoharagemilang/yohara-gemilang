// app/routes/admin/portofolio.tsx
import { ImageIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Form, Link, data, useFetcher, useSubmit } from 'react-router';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { useActionToast, useFlashToast } from '~/components/admin/use-action-feedback';
import { CldImage } from '~/components/cld-image';
import { Badge } from '~/components/ui/badge';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import type { ActionResult } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { deleteProject, listProjects, setProjectFeatured, setProjectStatus } from '~/services/portfolio.server';
import type { Route } from './+types/portofolio';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Portofolio | Admin Yohara Gemilang' }];
}

const statusItems = [
  { value: 'all', label: 'Semua status' },
  { value: 'PUBLISHED', label: 'Terbit' },
  { value: 'DRAFT', label: 'Draf' },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim().slice(0, 80) || undefined;
  const raw = url.searchParams.get('status');
  const status = raw === 'PUBLISHED' || raw === 'DRAFT' ? raw : undefined;
  const projects = await listProjects({ q, status, take: 100 });
  return {
    q: q ?? '',
    status: status ?? 'all',
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      city: p.city,
      year: p.year,
      status: p.status,
      isFeatured: p.isFeatured,
      service: p.service?.title ?? null,
      photos: p._count.images,
      cover: p.cover as MediaItem | null,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');
  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'status') {
    const status = form.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    await setProjectStatus(id, status);
    return data<ActionResult>({
      ok: true,
      message: status === 'PUBLISHED' ? 'Proyek diterbitkan' : 'Proyek dijadikan draf',
    });
  }
  if (intent === 'featured') {
    await setProjectFeatured(id, form.get('isFeatured') === 'true');
    return data<ActionResult>({ ok: true, message: 'Status unggulan diperbarui' });
  }
  if (intent === 'delete') {
    await deleteProject(id);
    return data<ActionResult>({ ok: true, message: 'Proyek dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Project = Route.ComponentProps['loaderData']['projects'][number];

export default function AdminPortofolio({ loaderData }: Route.ComponentProps) {
  const { projects, q, status } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const submit = useSubmit();
  const [deleting, setDeleting] = useState<Project | null>(null);

  useFlashToast({ dihapus: 'Proyek dihapus' });
  useActionToast(fetcher.data);

  const act = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });
  const filtered = q !== '' || status !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portofolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acara yang pernah ditangani. Hanya proyek berstatus Terbit yang tampil di situs.</p>
        </div>
        <Link to="/admin/portofolio/baru" className={buttonVariants()}>
          <Plus />
          Tambah proyek
        </Link>
      </div>

      <Form method="get" className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Cari judul atau kota" aria-label="Cari proyek" className="pl-8" />
        </div>
        <input type="hidden" name="status" value={status === 'all' ? '' : status} />
        <Select
          items={statusItems}
          value={status}
          onValueChange={(v) => {
            if (!v) return;
            const next = new URLSearchParams();
            if (q) next.set('q', q);
            if (v !== 'all') next.set('status', v);
            submit(next);
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">
          Cari
        </Button>
      </Form>

      {projects.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{filtered ? 'Tidak ada proyek yang cocok' : 'Belum ada proyek'}</EmptyTitle>
            <EmptyDescription>{filtered ? 'Ubah kata kunci atau filter status.' : 'Tambahkan proyek pertama agar tampil di situs.'}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyek</TableHead>
                  <TableHead className="w-28">Terbit</TableHead>
                  <TableHead className="w-28">Unggulan</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                          {p.cover ? <CldImage media={p.cover} aspect={20 / 12} widths={[160, 320]} sizes="80px" className="size-full object-cover" /> : <ImageIcon className="size-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/portofolio/${p.slug}`} className="font-medium underline-offset-4 hover:underline">
                            {p.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">{[p.city, p.year, p.service].filter(Boolean).join(' · ')}</p>
                          <div className="mt-1 flex gap-1.5">
                            <Badge variant={p.status === 'PUBLISHED' ? 'default' : 'secondary'}>{p.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}</Badge>
                            <Badge variant="outline">{p.photos} foto</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Terbitkan ${p.title}`} checked={p.status === 'PUBLISHED'} onCheckedChange={(checked) => act({ intent: 'status', id: p.id, status: checked ? 'PUBLISHED' : 'DRAFT' })} />
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Unggulkan ${p.title}`} checked={p.isFeatured} onCheckedChange={(checked) => act({ intent: 'featured', id: p.id, isFeatured: String(checked) })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/portofolio/${p.slug}`} aria-label={`Ubah ${p.title}`} className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${p.title}`} onClick={() => setDeleting(p)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Hapus proyek “${deleting?.title ?? ''}”?`}
        description="Foto proyek ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain."
        onConfirm={() => {
          if (deleting) act({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}
