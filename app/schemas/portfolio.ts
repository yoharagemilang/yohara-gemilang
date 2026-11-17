// app/schemas/portfolio.ts
import { z } from 'zod';
import { optionalDate, optionalId, requiredText, slugField } from './common';

const maxYear = new Date().getFullYear() + 1;

export const portfolioSchema = z.object({
  title: requiredText('Judul', 120),
  slug: slugField,
  summary: requiredText('Ringkasan', 300),
  // HTML dari editor. Dibersihkan di service. Boleh kosong.
  contentHtml: z.string().max(60000, 'Isi terlalu panjang'),
  city: requiredText('Kota', 60),
  year: z
    .string()
    .trim()
    .min(1, 'Tahun wajib diisi')
    .transform(Number)
    .refine((v) => Number.isInteger(v) && v >= 2000 && v <= maxYear, `Isi tahun antara 2000 dan ${maxYear}`),
  guestCount: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : Number(v.replace(/[.\s]/g, ''))))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 10_000_000), 'Isi jumlah tamu dengan angka bulat'),
  serviceId: z
    .string()
    .trim()
    .transform((v) => (v === '' || v === 'none' ? null : v)),
  coverId: optionalId,
  images: z
    .array(z.string().trim().min(1))
    .max(20, 'Maksimal 20 gambar')
    .refine((a) => new Set(a).size === a.length, 'Ada gambar yang dipilih dua kali'),
  status: z.enum(['DRAFT', 'PUBLISHED'], 'Pilih status'),
  isFeatured: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
  // Kolom tanggal hanya ada di form saat status Terbit, jadi boleh tidak dikirim
  publishedAt: optionalDate,
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
