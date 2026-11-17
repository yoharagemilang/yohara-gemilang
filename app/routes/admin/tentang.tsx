// app/routes/admin/tentang.tsx
import { useEffect, useState } from 'react';
import { Form, data, useNavigation } from 'react-router';
import { toast } from 'sonner';

import { ImageUploader } from '~/components/admin/image-uploader';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { htmlToPlain } from '~/lib/text-html';
import { aboutSchema } from '~/schemas/about';
import { fieldErrors, firstErrors } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { getAbout, saveAbout } from '~/services/about.server';
import { failure } from '~/services/helpers.server';
import type { Route } from './+types/tentang';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Tentang | Admin Yohara Gemilang' }];
}

export async function loader() {
  const about = await getAbout();
  return {
    about: {
      title: about?.title ?? '',
      subtitle: about?.subtitle ?? '',
      content: htmlToPlain(about?.contentHtml ?? ''),
      vision: about?.vision ?? '',
      mission: about?.mission ?? '',
      foundedYear: about?.foundedYear ? String(about.foundedYear) : '',
      cover: (about?.cover ?? null) as MediaItem | null,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const parsed = aboutSchema.safeParse(form);
  if (!parsed.success) {
    return data({ ok: false as const, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
  }
  const result = await saveAbout(parsed.data);
  if (!result.ok) {
    const f = failure(result);
    return data({ ok: false as const, errors: f.ok ? {} : (f.errors ?? { content: f.message ?? 'Gagal menyimpan' }) }, { status: 400 });
  }
  return { ok: true as const, errors: {} as Record<string, string> };
}

export default function AdminTentang({ loaderData, actionData }: Route.ComponentProps) {
  const { about } = loaderData;
  const [cover, setCover] = useState<MediaItem | null>(about.cover);
  const navigation = useNavigation();
  const saving = navigation.state === 'submitting';
  const errors = actionData?.ok === false ? actionData.errors : {};

  useEffect(() => {
    if (actionData?.ok) toast.success('Halaman Tentang disimpan');
    else if (actionData && !actionData.ok) toast.error('Periksa kembali isian yang bertanda merah');
  }, [actionData]);

  const field = (name: Exclude<keyof typeof about, 'cover'>) => ({
    id: name,
    name,
    defaultValue: about[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tentang</h1>
        <p className="mt-1 text-sm text-muted-foreground">Isi halaman Tentang. Daftar tim diatur di menu Tim. Perubahan tampil di situs dalam sekitar satu menit.</p>
      </div>

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Judul dan cerita</CardTitle>
            <CardDescription>Bagian utama halaman Tentang.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.title ? true : undefined}>
                <FieldLabel htmlFor="title">Judul</FieldLabel>
                <Input {...field('title')} maxLength={100} />
                {errors.title ? <FieldError>{errors.title}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.subtitle ? true : undefined}>
                <FieldLabel htmlFor="subtitle">Subjudul</FieldLabel>
                <Input {...field('subtitle')} maxLength={200} />
                {errors.subtitle ? <FieldError>{errors.subtitle}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.content ? true : undefined}>
                <FieldLabel htmlFor="content">Cerita perusahaan</FieldLabel>
                <Textarea {...field('content')} rows={10} maxLength={6000} />
                <FieldDescription>Pisahkan paragraf dengan satu baris kosong. Editor dengan format teks menyusul di tahap berikutnya.</FieldDescription>
                {errors.content ? <FieldError>{errors.content}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.foundedYear ? true : undefined} className="max-w-48">
                <FieldLabel htmlFor="foundedYear">Tahun berdiri</FieldLabel>
                <Input {...field('foundedYear')} type="number" inputMode="numeric" min={1950} placeholder="2015" />
                <FieldDescription>Opsional.</FieldDescription>
                {errors.foundedYear ? <FieldError>{errors.foundedYear}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visi dan misi</CardTitle>
            <CardDescription>Kosongkan kalau tidak ingin ditampilkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.vision ? true : undefined}>
                <FieldLabel htmlFor="vision">Visi</FieldLabel>
                <Textarea {...field('vision')} rows={3} maxLength={400} />
                {errors.vision ? <FieldError>{errors.vision}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.mission ? true : undefined}>
                <FieldLabel htmlFor="mission">Misi</FieldLabel>
                <Textarea {...field('mission')} rows={4} maxLength={800} />
                {errors.mission ? <FieldError>{errors.mission}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gambar sampul</CardTitle>
            <CardDescription>Tampil di samping cerita perusahaan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader name="coverId" label="Sampul" value={cover} onChange={setCover} error={errors.coverId} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            Simpan perubahan
          </Button>
        </div>
      </Form>
    </div>
  );
}
