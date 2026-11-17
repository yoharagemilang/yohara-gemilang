// app/routes/admin/pengaturan.tsx
import { useEffect } from 'react';
import { Form, data, useNavigation } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { fieldErrors, firstErrors } from '~/schemas/common';
import { settingsSchema } from '~/schemas/settings';
import { getSettings, saveSettings } from '~/services/settings.server';
import type { Route } from './+types/pengaturan';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Pengaturan | Admin Yohara Gemilang' }];
}

export async function loader() {
  const s = await getSettings();
  return {
    settings: {
      companyName: s?.companyName ?? '',
      tagline: s?.tagline ?? '',
      address: s?.address ?? '',
      phone: s?.phone ?? '',
      whatsapp: s?.whatsapp ?? '',
      email: s?.email ?? '',
      openingHours: s?.openingHours ?? '',
      mapQuery: s?.mapQuery ?? '',
      instagramUrl: s?.instagramUrl ?? '',
      linkedinUrl: s?.linkedinUrl ?? '',
      youtubeUrl: s?.youtubeUrl ?? '',
      seoTitle: s?.seoTitle ?? '',
      seoDescription: s?.seoDescription ?? '',
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const parsed = settingsSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    return data({ ok: false as const, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
  }
  await saveSettings(parsed.data);
  return { ok: true as const, errors: {} as Record<string, string> };
}

export default function AdminPengaturan({ loaderData, actionData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const navigation = useNavigation();
  const saving = navigation.state === 'submitting';
  const errors = actionData?.ok === false ? actionData.errors : {};

  useEffect(() => {
    if (actionData?.ok) toast.success('Pengaturan disimpan');
    else if (actionData && !actionData.ok) toast.error('Periksa kembali isian yang bertanda merah');
  }, [actionData]);

  const field = (name: keyof typeof settings) => ({
    id: name,
    name,
    defaultValue: settings[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Data perusahaan yang dipakai di footer, halaman Kontak, tombol WhatsApp, dan mesin pencari. Perubahan tampil di situs dalam sekitar satu menit.</p>
      </div>

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Perusahaan</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.companyName ? true : undefined}>
                <FieldLabel htmlFor="companyName">Nama perusahaan</FieldLabel>
                <Input {...field('companyName')} maxLength={100} />
                {errors.companyName ? <FieldError>{errors.companyName}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.tagline ? true : undefined}>
                <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                <Input {...field('tagline')} maxLength={160} />
                <FieldDescription>Opsional. Kalimat singkat di footer.</FieldDescription>
                {errors.tagline ? <FieldError>{errors.tagline}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontak</CardTitle>
            <CardDescription>Pengunjung menghubungi Anda lewat data ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.address ? true : undefined}>
                <FieldLabel htmlFor="address">Alamat</FieldLabel>
                <Textarea {...field('address')} rows={3} maxLength={300} />
                {errors.address ? <FieldError>{errors.address}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.mapQuery ? true : undefined}>
                <FieldLabel htmlFor="mapQuery">Kata kunci peta</FieldLabel>
                <Input {...field('mapQuery')} maxLength={200} />
                <FieldDescription>Dipakai untuk menampilkan peta Google di halaman Kontak. Alamat singkat atau nama tempat.</FieldDescription>
                {errors.mapQuery ? <FieldError>{errors.mapQuery}</FieldError> : null}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={errors.phone ? true : undefined}>
                  <FieldLabel htmlFor="phone">Telepon</FieldLabel>
                  <Input {...field('phone')} inputMode="tel" maxLength={25} />
                  {errors.phone ? <FieldError>{errors.phone}</FieldError> : null}
                </Field>
                <Field data-invalid={errors.whatsapp ? true : undefined}>
                  <FieldLabel htmlFor="whatsapp">Nomor WhatsApp</FieldLabel>
                  <Input {...field('whatsapp')} inputMode="tel" maxLength={25} />
                  <FieldDescription>Boleh diawali 0 atau 62. Tombol WhatsApp memakai nomor ini.</FieldDescription>
                  {errors.whatsapp ? <FieldError>{errors.whatsapp}</FieldError> : null}
                </Field>
              </div>
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...field('email')} inputMode="email" maxLength={120} />
                {errors.email ? <FieldError>{errors.email}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.openingHours ? true : undefined}>
                <FieldLabel htmlFor="openingHours">Jam kerja</FieldLabel>
                <Input {...field('openingHours')} maxLength={160} />
                {errors.openingHours ? <FieldError>{errors.openingHours}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media sosial</CardTitle>
            <CardDescription>Kosongkan yang tidak dipakai. Ikonnya tidak tampil di situs.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.instagramUrl ? true : undefined}>
                <FieldLabel htmlFor="instagramUrl">Instagram</FieldLabel>
                <Input {...field('instagramUrl')} placeholder="https://instagram.com/yoharagemilang" />
                {errors.instagramUrl ? <FieldError>{errors.instagramUrl}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.linkedinUrl ? true : undefined}>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                <Input {...field('linkedinUrl')} placeholder="https://linkedin.com/company/yoharagemilang" />
                {errors.linkedinUrl ? <FieldError>{errors.linkedinUrl}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.youtubeUrl ? true : undefined}>
                <FieldLabel htmlFor="youtubeUrl">YouTube</FieldLabel>
                <Input {...field('youtubeUrl')} placeholder="https://youtube.com/@yoharagemilang" />
                {errors.youtubeUrl ? <FieldError>{errors.youtubeUrl}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO dasar</CardTitle>
            <CardDescription>Judul dan deskripsi bawaan di hasil pencarian Google. Halaman portofolio dan artikel memakai judul masing-masing.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.seoTitle ? true : undefined}>
                <FieldLabel htmlFor="seoTitle">Judul</FieldLabel>
                <Input {...field('seoTitle')} maxLength={70} />
                <FieldDescription>Maksimal 70 karakter.</FieldDescription>
                {errors.seoTitle ? <FieldError>{errors.seoTitle}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.seoDescription ? true : undefined}>
                <FieldLabel htmlFor="seoDescription">Deskripsi</FieldLabel>
                <Textarea {...field('seoDescription')} rows={3} maxLength={160} />
                <FieldDescription>Maksimal 160 karakter.</FieldDescription>
                {errors.seoDescription ? <FieldError>{errors.seoDescription}</FieldError> : null}
              </Field>
            </FieldGroup>
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
