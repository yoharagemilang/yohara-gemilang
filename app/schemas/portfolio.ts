// app/schemas/portfolio.ts
import { z } from 'zod';
import { optionalId, requiredText } from './common';

const maxYear = new Date().getFullYear() + 1;

export const portfolioSchema = z.object({
  title: requiredText('Judul', 120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Slug wajib diisi')
    .max(100, 'Maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Hanya huruf kecil, angka, dan tanda hubung. Contoh: gala-dinner-2026')
    // "baru" dipakai alamat form tambah (/admin/portofolio/baru)
    .refine((v) => v !== 'baru', 'Slug ini dipakai sistem, pilih yang lain'),
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
  publishedAt: z
    .string()
    .trim()
    .default('')
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), 'Tanggal tidak valid')
    .transform((v) => (v ? new Date(`${v}T00:00:00.000Z`) : null)),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
