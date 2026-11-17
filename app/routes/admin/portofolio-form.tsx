// app/routes/admin/portofolio-form.tsx
// Dipakai untuk tambah (/admin/portofolio/baru) dan ubah (/admin/portofolio/:slug).
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, Link, data, redirect, useNavigation, useSubmit } from 'react-router';
import { toast } from 'sonner';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { GalleryField } from '~/components/admin/gallery-field';
import { ImageUploader } from '~/components/admin/image-uploader';
import { RichTextEditor } from '~/components/admin/rich-text-editor';
import { useFlashToast } from '~/components/admin/use-action-feedback';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import { slugify } from '~/lib/slug';
import { fieldErrors, firstErrors } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { portfolioSchema } from '~/schemas/portfolio';
import { failure } from '~/services/helpers.server';
import { deleteProject, findProjectId, getProjectBySlug, listServiceOptions, saveProject } from '~/services/portfolio.server';
import type { Route } from './+types/portofolio-form';

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.project.isNew ? 'Proyek baru' : (loaderData?.project.title ?? 'Proyek');
  return [{ title: `${title} | Admin Yohara Gemilang` }];
}

const statusItems = [
  { value: 'DRAFT', label: 'Draf (belum tampil di situs)' },
  { value: 'PUBLISHED', label: 'Terbit (tampil di situs)' },
];

export async function loader({ params }: Route.LoaderArgs) {
  const services = await listServiceOptions();
  const empty = {
    isNew: true,
    id: '',
    title: '',
    slug: '',
    summary: '',
    contentHtml: '',
    city: '',
    year: String(new Date().getFullYear()),
    guestCount: '',
    serviceId: 'none',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    isFeatured: false,
    publishedAt: '',
    cover: null as MediaItem | null,
    images: [] as MediaItem[],
  };
  if (params.slug === 'baru') return { services, project: empty };

  const p = await getProjectBySlug(params.slug);
  if (!p) throw data('Proyek tidak ditemukan', { status: 404 });
  return {
    services,
    project: {
      isNew: false,
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      contentHtml: p.contentHtml,
      city: p.city,
      year: String(p.year),
      guestCount: p.guestCount ? String(p.guestCount) : '',
      serviceId: p.serviceId ?? 'none',
      status: p.status,
      isFeatured: p.isFeatured,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : '',
      cover: p.cover as MediaItem | null,
      images: p.images.map((i) => i.media) as MediaItem[],
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const isNew = params.slug === 'baru';
  const id = isNew ? null : await findProjectId(params.slug);
  if (!isNew && !id) throw data('Proyek tidak ditemukan', { status: 404 });

  if (form.get('intent') === 'delete' && id) {
    await deleteProject(id);
    return redirect('/admin/portofolio?info=dihapus');
  }

  const parsed = portfolioSchema.safeParse({
    ...Object.fromEntries(form),
    images: form.getAll('images').map(String),
  });
  if (!parsed.success) {
    return data({ ok: false as const, message: undefined, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
  }

  const result = await saveProject(id, parsed.data);
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
  if (isNew) return redirect(`/admin/portofolio/${result.slug}?info=dibuat`);
  if (result.slug !== params.slug) return redirect(`/admin/portofolio/${result.slug}?info=disimpan`);
  return { ok: true as const, message: undefined, errors: {} as Record<string, string> };
}

export default function AdminPortofolioForm({ loaderData, actionData }: Route.ComponentProps) {
  // key: form dimuat ulang dari data server saat proyek baru selesai dibuat
  return <ProjectForm key={loaderData.project.id || 'baru'} loaderData={loaderData} actionData={actionData} />;
}

function ProjectForm({ loaderData, actionData }: Pick<Route.ComponentProps, 'loaderData' | 'actionData'>) {
  const { project, services } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const saving = navigation.state === 'submitting' && navigation.formData?.get('intent') !== 'delete';
  const errors = actionData?.ok === false ? actionData.errors : {};

  const [slug, setSlug] = useState(project.slug);
  const [slugTouched, setSlugTouched] = useState(!project.isNew);
  const [cover, setCover] = useState<MediaItem | null>(project.cover);
  const [images, setImages] = useState<MediaItem[]>(project.images);
  const [serviceId, setServiceId] = useState(project.serviceId);
  const [status, setStatus] = useState<string>(project.status);
  const [featured, setFeatured] = useState(project.isFeatured);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useFlashToast({
    dibuat: 'Proyek dibuat. Lanjutkan dengan menambah gambar dan isi.',
    disimpan: 'Proyek disimpan',
  });

  useEffect(() => {
    if (actionData?.ok) toast.success('Proyek disimpan');
    else if (actionData && !actionData.ok) {
      toast.error(actionData.message ?? 'Periksa kembali isian yang bertanda merah');
    }
  }, [actionData]);

  const field = (name: 'title' | 'summary' | 'city' | 'year' | 'guestCount') => ({
    id: name,
    name,
    defaultValue: project[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
  });

  const serviceItems = [{ value: 'none', label: 'Tanpa layanan' }, ...services.map((s) => ({ value: s.id, label: s.title }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/portofolio" className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-2 mb-1' })}>
            <ArrowLeft />
            Portofolio
          </Link>
          <h1 className="text-2xl font-bold">{project.isNew ? 'Proyek baru' : 'Ubah proyek'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Perubahan tampil di situs dalam sekitar satu menit setelah status Terbit.</p>
        </div>
        {!project.isNew ? (
          <Button variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            Hapus proyek
          </Button>
        ) : null}
      </div>

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
            <CardDescription>Data singkat yang tampil di kartu dan halaman detail.</CardDescription>
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
                <FieldDescription>Alamat di situs: /portofolio/{slug || 'slug-proyek'}. Terisi otomatis dari judul.</FieldDescription>
                {errors.slug ? <FieldError>{errors.slug}</FieldError> : null}
              </Field>

              <Field data-invalid={errors.summary ? true : undefined}>
                <FieldLabel htmlFor="summary">Ringkasan</FieldLabel>
                <Textarea {...field('summary')} rows={3} maxLength={300} />
                {errors.summary ? <FieldError>{errors.summary}</FieldError> : null}
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={errors.city ? true : undefined}>
                  <FieldLabel htmlFor="city">Kota</FieldLabel>
                  <Input {...field('city')} maxLength={60} />
                  {errors.city ? <FieldError>{errors.city}</FieldError> : null}
                </Field>
                <Field data-invalid={errors.year ? true : undefined}>
                  <FieldLabel htmlFor="year">Tahun</FieldLabel>
                  <Input {...field('year')} inputMode="numeric" maxLength={4} />
                  {errors.year ? <FieldError>{errors.year}</FieldError> : null}
                </Field>
                <Field data-invalid={errors.guestCount ? true : undefined}>
                  <FieldLabel htmlFor="guestCount">Jumlah tamu</FieldLabel>
                  <Input {...field('guestCount')} inputMode="numeric" placeholder="Opsional" />
                  {errors.guestCount ? <FieldError>{errors.guestCount}</FieldError> : null}
                </Field>
              </div>

              <Field data-invalid={errors.serviceId ? true : undefined}>
                <FieldLabel>Layanan</FieldLabel>
                <Select name="serviceId" items={serviceItems} value={serviceId} onValueChange={(v) => v && setServiceId(v)}>
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceItems.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceId ? <FieldError>{errors.serviceId}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cerita proyek</CardTitle>
            <CardDescription>Isi halaman detail. Boleh dikosongkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor name="contentHtml" label="Isi" value={project.contentHtml} error={errors.contentHtml} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gambar</CardTitle>
            <CardDescription>Sampul tampil di kartu. Galeri tampil di halaman detail.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <ImageUploader name="coverId" label="Sampul" value={cover} onChange={setCover} error={errors.coverId} />
              <GalleryField name="images" label="Galeri" value={images} onChange={setImages} max={20} error={errors.images} />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publikasi</CardTitle>
            <CardDescription>Proyek draf hanya terlihat di admin.</CardDescription>
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
                  <Input id="publishedAt" name="publishedAt" type="date" defaultValue={project.publishedAt} aria-invalid={errors.publishedAt ? true : undefined} />
                  <FieldDescription>Kosongkan untuk memakai hari ini.</FieldDescription>
                  {errors.publishedAt ? <FieldError>{errors.publishedAt}</FieldError> : null}
                </Field>
              ) : null}

              <Field orientation="horizontal">
                <Switch id="isFeatured" checked={featured} onCheckedChange={setFeatured} />
                {featured ? <input type="hidden" name="isFeatured" value="on" /> : null}
                <FieldLabel htmlFor="isFeatured" className="font-normal">
                  Tampilkan sebagai proyek unggulan di Beranda
                </FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/admin/portofolio" className={buttonVariants({ variant: 'outline' })}>
            Kembali
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {project.isNew ? 'Buat proyek' : 'Simpan perubahan'}
          </Button>
        </div>
      </Form>

      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Hapus proyek “${project.title}”?`}
        description="Foto proyek ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain."
        onConfirm={() => {
          setConfirmDelete(false);
          submit({ intent: 'delete' }, { method: 'post' });
        }}
      />
    </div>
  );
}
