// app/schemas/article.ts
import { z } from 'zod';
import { optionalDate, optionalId, requiredText, slugField } from './common';

export const articleSchema = z.object({
  title: requiredText('Judul', 120),
  slug: slugField,
  excerpt: requiredText('Ringkasan', 300),
  // HTML dari editor. Dibersihkan di service. Wajib berisi saat status Terbit.
  contentHtml: z.string().max(60000, 'Isi terlalu panjang'),
  category: requiredText('Kategori', 40),
  coverId: optionalId,
  status: z.enum(['DRAFT', 'PUBLISHED'], 'Pilih status'),
  // Kolom tanggal hanya ada di form saat status Terbit, jadi boleh tidak dikirim
  publishedAt: optionalDate,
});

export type ArticleInput = z.infer<typeof articleSchema>;
