// app/schemas/about.ts
import { z } from 'zod';
import { optionalId, plainText, requiredText } from './common';

export const aboutSchema = z.object({
  title: requiredText('Judul', 100),
  subtitle: requiredText('Subjudul', 200),
  // HTML dari editor. Dibersihkan dan dicek tidak kosong di service.
  contentHtml: z.string().max(60000, 'Cerita terlalu panjang'),
  vision: plainText(400),
  mission: plainText(800),
  foundedYear: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1950 && v <= new Date().getFullYear()), 'Isi tahun yang masuk akal, misalnya 2015'),
  coverId: optionalId,
});

export type AboutInput = z.infer<typeof aboutSchema>;
