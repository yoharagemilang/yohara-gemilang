// app/routes/admin/artikel.tsx
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
import { deleteArticle, listArticles, setArticleStatus } from '~/services/article.server';
import type { Route } from './+types/artikel';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Artikel | Admin Yohara Gemilang' }];
}

const statusItems = [
  { value: 'all', label: 'Semua status' },
  { value: 'PUBLISHED', label: 'Terbit' },
  { value: 'DRAFT', label: 'Draf' },
];

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC', // tanggal terbit tersimpan tanpa jam
});

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim().slice(0, 80) || undefined;
  const raw = url.searchParams.get('status');
  const status = raw === 'PUBLISHED' || raw === 'DRAFT' ? raw : undefined;
  const articles = await listArticles({ q, status, take: 100 });
  return {
    q: q ?? '',
    status: status ?? 'all',
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      status: a.status,
      readingMinutes: a.readingMinutes,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      cover: a.cover as MediaItem | null,
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
    const result = await setArticleStatus(id, status);
    if (!result.ok) return data<ActionResult>({ ok: false, message: result.message }, { status: 400 });
    return data<ActionResult>({
      ok: true,
      message: status === 'PUBLISHED' ? 'Artikel diterbitkan' : 'Artikel dijadikan draf',
    });
  }
  if (intent === 'delete') {
    await deleteArticle(id);
    return data<ActionResult>({ ok: true, message: 'Artikel dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Article = Route.ComponentProps['loaderData']['articles'][number];

export default function AdminArtikel({ loaderData }: Route.ComponentProps) {
  const { articles, q, status } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const submit = useSubmit();
  const [deleting, setDeleting] = useState<Article | null>(null);

  useFlashToast({ dihapus: 'Artikel dihapus' });
  useActionToast(fetcher.data);

  const act = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });
  const filtered = q !== '' || status !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Artikel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tulisan dan tips untuk calon klien. Hanya artikel berstatus Terbit yang tampil di situs.</p>
        </div>
        <Link to="/admin/artikel/baru" className={buttonVariants()}>
          <Plus />
          Tulis artikel
        </Link>
      </div>

      <Form method="get" className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Cari judul atau kategori" aria-label="Cari artikel" className="pl-8" />
        </div>
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

      {articles.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{filtered ? 'Tidak ada artikel yang cocok' : 'Belum ada artikel'}</EmptyTitle>
            <EmptyDescription>{filtered ? 'Ubah kata kunci atau filter status.' : 'Tulis artikel pertama agar tampil di situs.'}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead className="w-28">Terbit</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                          {a.cover ? <CldImage media={a.cover} aspect={20 / 12} widths={[160, 320]} sizes="80px" className="size-full object-cover" /> : <ImageIcon className="size-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/artikel/${a.slug}`} className="font-medium underline-offset-4 hover:underline">
                            {a.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">{[a.category, `${a.readingMinutes} menit baca`, a.publishedAt ? dateFmt.format(new Date(a.publishedAt)) : null].filter(Boolean).join(' · ')}</p>
                          <div className="mt-1">
                            <Badge variant={a.status === 'PUBLISHED' ? 'default' : 'secondary'}>{a.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Terbitkan ${a.title}`} checked={a.status === 'PUBLISHED'} onCheckedChange={(checked) => act({ intent: 'status', id: a.id, status: checked ? 'PUBLISHED' : 'DRAFT' })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/artikel/${a.slug}`} aria-label={`Ubah ${a.title}`} className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${a.title}`} onClick={() => setDeleting(a)}>
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
        title={`Hapus artikel “${deleting?.title ?? ''}”?`}
        description="Gambar sampul ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain."
        onConfirm={() => {
          if (deleting) act({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}
