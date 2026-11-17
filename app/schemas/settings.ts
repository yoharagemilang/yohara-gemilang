// app/schemas/settings.ts
import { z } from 'zod';
import { optionalUrl, plainText, requiredText } from './common';

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .regex(/^\+?[\d\s().-]{6,25}$/, `${label} tidak valid. Contoh: 0812-3456-7890`);

export const settingsSchema = z.object({
  companyName: requiredText('Nama perusahaan', 100),
  tagline: plainText(160),
  address: requiredText('Alamat', 300),
  phone: phone('Telepon'),
  whatsapp: phone('Nomor WhatsApp'),
  email: z.string().trim().min(1, 'Email wajib diisi').max(120, 'Maksimal 120 karakter').pipe(z.email('Email tidak valid')),
  openingHours: requiredText('Jam kerja', 160),
  mapQuery: requiredText('Kata kunci peta', 200),
  instagramUrl: optionalUrl(['instagram.com']),
  linkedinUrl: optionalUrl(['linkedin.com']),
  youtubeUrl: optionalUrl(['youtube.com', 'youtu.be']),
  seoTitle: requiredText('Judul SEO', 70),
  seoDescription: requiredText('Deskripsi SEO', 160),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
