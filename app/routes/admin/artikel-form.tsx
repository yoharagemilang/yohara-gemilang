// app/routes/admin/artikel-form.tsx
// Dipakai untuk tulis baru (/admin/artikel/baru) dan ubah (/admin/artikel/:slug).
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, Link, data, redirect, useNavigation, useSubmit } from 'react-router';
import { toast } from 'sonner';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { ImageUploader } from '~/components/admin/image-uploader';
import { RichTextEditor } from '~/components/admin/rich-text-editor';
import { useFlashToast } from '~/components/admin/use-action-feedback';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { slugify } from '~/lib/slug';
import { articleSchema } from '~/schemas/article';
import { fieldErrors, firstErrors } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { deleteArticle, findArticleId, getArticleBySlug, listCategories, saveArticle } from '~/services/article.server';
import { failure } from '~/services/helpers.server';
import type { Route } from './+types/artikel-form';

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.article.isNew ? 'Artikel baru' : (loaderData?.article.title ?? 'Artikel');
  return [{ title: `${title} | Admin Yohara Gemilang` }];
}

const statusItems = [
  { value: 'DRAFT', label: 'Draf (belum tampil di situs)' },
  { value: 'PUBLISHED', label: 'Terbit (tampil di situs)' },
];

export async function loader({ params }: Route.LoaderArgs) {
  const categories = await listCategories();
  const empty = {
    isNew: true,
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    contentHtml: '',
    category: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    publishedAt: '',
    cover: null as MediaItem | null,
  };
  if (params.slug === 'baru') return { categories, article: empty };

  const a = await getArticleBySlug(params.slug);
  if (!a) throw data('Artikel tidak ditemukan', { status: 404 });
  return {
    categories,
    article: {
      isNew: false,
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      contentHtml: a.contentHtml,
      category: a.category,
      status: a.status,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString().slice(0, 10) : '',
      cover: a.cover as MediaItem | null,
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const isNew = params.slug === 'baru';
  const id = isNew ? null : await findArticleId(params.slug);
  if (!isNew && !id) throw data('Artikel tidak ditemukan', { status: 404 });

  if (form.get('intent') === 'delete' && id) {
    await deleteArticle(id);
    return redirect('/admin/artikel?info=dihapus');
  }

  const parsed = articleSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return data({ ok: false as const, message: undefined, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
  }

  const result = await saveArticle(id, parsed.data);
  if (!result.ok) {
    const f = failure(result);
    return data(
      {
        ok: false as const,
        message: f.ok ? undefined : f.message,
        errors: (f.ok ? {} : (f.errors ?? {})) as Record<string, string>,
      },
      { status: 400 },
    );
  }
  // Alamat admin memakai slug: setelah dibuat atau slug diganti, pindah ke alamat barunya
  if (isNew) return redirect(`/admin/artikel/${result.slug}?info=dibuat`);
  if (result.slug !== params.slug) return redirect(`/admin/artikel/${result.slug}?info=disimpan`);
  return { ok: true as const, message: undefined, errors: {} as Record<string, string> };
}

export default function AdminArtikelForm({ loaderData, actionData }: Route.ComponentProps) {
  // key: form dimuat ulang dari data server saat artikel baru selesai dibuat
  return <ArticleForm key={loaderData.article.id || 'baru'} loaderData={loaderData} actionData={actionData} />;
}

function ArticleForm({ loaderData, actionData }: Pick<Route.ComponentProps, 'loaderData' | 'actionData'>) {
  const { article, categories } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const saving = navigation.state === 'submitting' && navigation.formData?.get('intent') !== 'delete';
  const errors = actionData?.ok === false ? actionData.errors : {};

  const [slug, setSlug] = useState(article.slug);
  const [slugTouched, setSlugTouched] = useState(!article.isNew);
  const [cover, setCover] = useState<MediaItem | null>(article.cover);
  const [status, setStatus] = useState<string>(article.status);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useFlashToast({
    dibuat: 'Artikel dibuat. Lanjutkan dengan menulis isi dan menambah sampul.',
    disimpan: 'Artikel disimpan',
  });

  useEffect(() => {
    if (actionData?.ok) toast.success('Artikel disimpan');
    else if (actionData && !actionData.ok) {
      toast.error(actionData.message ?? 'Periksa kembali isian yang bertanda merah');
    }
  }, [actionData]);

  const field = (name: 'title' | 'excerpt' | 'category') => ({
    id: name,
    name,
    defaultValue: article[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/artikel" className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-2 mb-1' })}>
            <ArrowLeft />
            Artikel
          </Link>
          <h1 className="text-2xl font-bold">{article.isNew ? 'Artikel baru' : 'Ubah artikel'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Perubahan tampil di situs dalam sekitar satu menit setelah status Terbit.</p>
        </div>
        {!article.isNew ? (
          <Button variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            Hapus artikel
          </Button>
        ) : null}
      </div>

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
            <CardDescription>Judul, ringkasan, dan kategori tampil di daftar artikel.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.title ? true : undefined}>
                <FieldLabel htmlFor="title">Judul</FieldLabel>
                <Input
                  {...field('title')}
                  maxLength={120}
                  onChange={(e) => {
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
                {errors.title ? <FieldError>{errors.title}</FieldError> : null}
              </Field>

              <Field data-invalid={errors.slug ? true : undefined}>
                <FieldLabel htmlFor="slug">Slug (bagian alamat)</FieldLabel>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  maxLength={100}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  aria-invalid={errors.slug ? true : undefined}
                />
                <FieldDescription>Alamat di situs: /artikel/{slug || 'slug-artikel'}. Terisi otomatis dari judul.</FieldDescription>
                {errors.slug ? <FieldError>{errors.slug}</FieldError> : null}
              </Field>

              <Field data-invalid={errors.excerpt ? true : undefined}>
                <FieldLabel htmlFor="excerpt">Ringkasan</FieldLabel>
                <Textarea {...field('excerpt')} rows={3} maxLength={300} />
                <FieldDescription>Dua kalimat yang mengundang orang membaca. Maksimal 300 karakter.</FieldDescription>
                {errors.excerpt ? <FieldError>{errors.excerpt}</FieldError> : null}
              </Field>

              <Field data-invalid={errors.category ? true : undefined} className="max-w-sm">
                <FieldLabel htmlFor="category">Kategori</FieldLabel>
                <Input {...field('category')} maxLength={40} list="category-options" autoComplete="off" />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <FieldDescription>Pilih yang sudah ada atau ketik kategori baru.</FieldDescription>
                {errors.category ? <FieldError>{errors.category}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Isi artikel</CardTitle>
            <CardDescription>Menit baca dihitung otomatis. Isi wajib ada sebelum artikel diterbitkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor name="contentHtml" label="Isi" value={article.contentHtml} error={errors.contentHtml} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sampul</CardTitle>
            <CardDescription>Tampil di daftar artikel dan di bagian atas artikel.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader name="coverId" label="Gambar sampul" value={cover} onChange={setCover} error={errors.coverId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publikasi</CardTitle>
            <CardDescription>Artikel draf hanya terlihat di admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.status ? true : undefined}>
                <FieldLabel>Status</FieldLabel>
                <Select name="status" items={statusItems} value={status} onValueChange={(v) => v && setStatus(v)}>
                  <SelectTrigger className="w-full max-w-sm">
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
                {errors.status ? <FieldError>{errors.status}</FieldError> : null}
              </Field>

              {status === 'PUBLISHED' ? (
                <Field data-invalid={errors.publishedAt ? true : undefined} className="max-w-48">
                  <FieldLabel htmlFor="publishedAt">Tanggal terbit</FieldLabel>
                  <Input id="publishedAt" name="publishedAt" type="date" defaultValue={article.publishedAt} aria-invalid={errors.publishedAt ? true : undefined} />
                  <FieldDescription>Kosongkan untuk memakai hari ini.</FieldDescription>
                  {errors.publishedAt ? <FieldError>{errors.publishedAt}</FieldError> : null}
                </Field>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/admin/artikel" className={buttonVariants({ variant: 'outline' })}>
            Kembali
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {article.isNew ? 'Buat artikel' : 'Simpan perubahan'}
          </Button>
        </div>
      </Form>

      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Hapus artikel “${article.title}”?`}
        description="Gambar sampul ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain."
        onConfirm={() => {
          setConfirmDelete(false);
          submit({ intent: 'delete' }, { method: 'post' });
        }}
      />
    </div>
  );
}
