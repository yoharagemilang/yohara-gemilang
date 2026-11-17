// app/schemas/hero.ts
import { z } from 'zod';
import { MAX_HERO_SLIDES } from '~/lib/image-rules';
import { linkHref, optionalText, requiredText } from './common';

const slideSchema = z.object({
  mediaId: z.string().min(1),
  captionTitle: optionalText(80),
  captionMeta: optionalText(120),
});

export type HeroSlideInput = z.infer<typeof slideSchema>;

/** Slide dikirim sebagai satu kolom JSON dari form. */
const slidesField = z
  .string()
  .default('[]')
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Data slide tidak valid' });
      return z.NEVER;
    }
  })
  .pipe(z.array(slideSchema).max(MAX_HERO_SLIDES, `Maksimal ${MAX_HERO_SLIDES} slide`));

export const heroSchema = z
  .object({
    eyebrow: requiredText('Label kecil', 60),
    heading: requiredText('Judul', 140),
    headingAccent: requiredText('Judul aksen', 100),
    description: requiredText('Deskripsi', 400),
    primaryLabel: requiredText('Teks tombol utama', 40),
    primaryHref: linkHref,
    secondaryLabel: optionalText(40),
    secondaryHref: z
      .string()
      .trim()
      .transform((v) => (v === '' ? null : v)),
    slides: slidesField,
  })
  .superRefine((v, ctx) => {
    if (v.secondaryLabel && !v.secondaryHref) {
      ctx.addIssue({ code: 'custom', path: ['secondaryHref'], message: 'Isi tautan tombol kedua' });
    }
    if (v.secondaryHref) {
      if (!v.secondaryLabel) {
        ctx.addIssue({ code: 'custom', path: ['secondaryLabel'], message: 'Isi teks tombol kedua' });
      }
      if (!linkHref.safeParse(v.secondaryHref).success) {
        ctx.addIssue({
          code: 'custom',
          path: ['secondaryHref'],
          message: 'Gunakan tautan seperti /portofolio atau https://...',
        });
      }
    }
    const ids = v.slides.map((s) => s.mediaId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', path: ['slides'], message: 'Ada slide yang sama dipakai dua kali' });
    }
  });

export type HeroInput = z.infer<typeof heroSchema>;
