// app/routes/admin/hero.tsx
import { useEffect, useState } from 'react';
import { Form, data, useNavigation } from 'react-router';
import { toast } from 'sonner';

import { SlidesField, type Slide } from '~/components/admin/slides-field';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { fieldErrors, firstErrors } from '~/schemas/common';
import { heroSchema } from '~/schemas/hero';
import { getHero, saveHero } from '~/services/hero.server';
import type { Route } from './+types/hero';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Hero | Admin Yohara Gemilang' }];
}

export async function loader() {
  const hero = await getHero();
  return {
    hero: {
      eyebrow: hero?.eyebrow ?? '',
      heading: hero?.heading ?? '',
      headingAccent: hero?.headingAccent ?? '',
      description: hero?.description ?? '',
      primaryLabel: hero?.primaryLabel ?? '',
      primaryHref: hero?.primaryHref ?? '',
      secondaryLabel: hero?.secondaryLabel ?? '',
      secondaryHref: hero?.secondaryHref ?? '',
      slides: (hero?.slides ?? []).map((s) => ({
        media: s.media,
        captionTitle: s.captionTitle ?? '',
        captionMeta: s.captionMeta ?? '',
      })),
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const parsed = heroSchema.safeParse(form);
  if (!parsed.success) {
    return data({ ok: false as const, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
  }
  const result = await saveHero(parsed.data);
  if (!result.ok) {
    return data({ ok: false as const, errors: { [result.field]: result.message } }, { status: 400 });
  }
  return { ok: true as const, errors: {} as Record<string, string> };
}

export default function AdminHero({ loaderData, actionData }: Route.ComponentProps) {
  const { hero } = loaderData;
  const [slides, setSlides] = useState<Slide[]>(hero.slides);
  const navigation = useNavigation();
  const saving = navigation.state === 'submitting';
  const errors = actionData?.ok === false ? actionData.errors : {};

  useEffect(() => {
    if (actionData?.ok) toast.success('Hero disimpan');
    else if (actionData && !actionData.ok) toast.error('Periksa kembali isian yang bertanda merah');
  }, [actionData]);

  const field = (name: Exclude<keyof typeof hero, 'slides'>) => ({
    id: name,
    name,
    defaultValue: hero[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hero</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bagian paling atas halaman Beranda. Perubahan tampil di situs dalam sekitar satu menit.</p>
      </div>

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teks utama</CardTitle>
            <CardDescription>Judul dibagi dua: bagian biasa dan bagian aksen berwarna merah.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={errors.eyebrow ? true : undefined}>
                <FieldLabel htmlFor="eyebrow">Label kecil</FieldLabel>
                <Input {...field('eyebrow')} maxLength={60} />
                {errors.eyebrow ? <FieldError>{errors.eyebrow}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.heading ? true : undefined}>
                <FieldLabel htmlFor="heading">Judul</FieldLabel>
                <Input {...field('heading')} maxLength={140} />
                {errors.heading ? <FieldError>{errors.heading}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.headingAccent ? true : undefined}>
                <FieldLabel htmlFor="headingAccent">Judul aksen (merah)</FieldLabel>
                <Input {...field('headingAccent')} maxLength={100} />
                {errors.headingAccent ? <FieldError>{errors.headingAccent}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.description ? true : undefined}>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Textarea {...field('description')} rows={3} maxLength={400} />
                {errors.description ? <FieldError>{errors.description}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tombol</CardTitle>
            <CardDescription>Tombol kedua boleh dikosongkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="md:grid md:grid-cols-2">
              <Field data-invalid={errors.primaryLabel ? true : undefined}>
                <FieldLabel htmlFor="primaryLabel">Tombol utama: teks</FieldLabel>
                <Input {...field('primaryLabel')} maxLength={40} />
                {errors.primaryLabel ? <FieldError>{errors.primaryLabel}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.primaryHref ? true : undefined}>
                <FieldLabel htmlFor="primaryHref">Tombol utama: tautan</FieldLabel>
                <Input {...field('primaryHref')} placeholder="/kontak" />
                {errors.primaryHref ? <FieldError>{errors.primaryHref}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.secondaryLabel ? true : undefined}>
                <FieldLabel htmlFor="secondaryLabel">Tombol kedua: teks</FieldLabel>
                <Input {...field('secondaryLabel')} maxLength={40} />
                {errors.secondaryLabel ? <FieldError>{errors.secondaryLabel}</FieldError> : null}
              </Field>
              <Field data-invalid={errors.secondaryHref ? true : undefined}>
                <FieldLabel htmlFor="secondaryHref">Tombol kedua: tautan</FieldLabel>
                <Input {...field('secondaryHref')} placeholder="/portofolio" />
                {errors.secondaryHref ? <FieldError>{errors.secondaryHref}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slide</CardTitle>
            <CardDescription>Sisi gambar di hero berupa carousel. Tiap slide punya keterangan kecil sendiri.</CardDescription>
          </CardHeader>
          <CardContent>
            <SlidesField name="slides" value={slides} onChange={setSlides} error={errors.slides} />
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
