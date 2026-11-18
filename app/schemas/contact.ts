// app/schemas/contact.ts
// Validasi formulir kontak publik. Pesan error berbahasa Indonesia, tampil langsung di bawah kolom.
import { z } from 'zod';

import { waNumber } from '~/lib/contact';
import { optionalDate, requiredText } from './common';

/** Tanggal hari ini di Jakarta (YYYY-MM-DD), supaya "hari ini" tidak ikut zona waktu server. */
function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

/** Nomor seluler Indonesia: 0812..., +62 812..., atau 812... (8-12 digit setelah 628). */
export function isIndonesianMobile(raw: string) {
  if (!/^[\d\s()+\-.]+$/.test(raw)) return false;
  return /^628\d{7,11}$/.test(waNumber(raw));
}

export const contactSchema = z.object({
  name: requiredText('Nama', 80).min(2, 'Nama minimal 2 karakter'),
  whatsapp: z.string().trim().min(1, 'Nomor WhatsApp wajib diisi').max(30, 'Maksimal 30 karakter').refine(isIndonesianMobile, 'Masukkan nomor WhatsApp yang valid, mis. 0812-3456-7890'),
  email: z
    .string()
    .trim()
    .max(120, 'Maksimal 120 karakter')
    .default('')
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || z.email().safeParse(v).success, 'Format email tidak valid'),
  eventType: requiredText('Jenis acara', 80),
  eventDate: optionalDate.refine((d) => d === null || d.getTime() >= Date.parse(`${todayJakarta()}T00:00:00.000Z`), 'Tanggal acara tidak boleh sudah lewat'),
  message: z
    .string()
    .trim()
    .max(2000, 'Maksimal 2000 karakter')
    .default('')
    .transform((v) => (v === '' ? null : v)),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Hasil action formulir kontak. Data pengirim dikembalikan untuk layar sukses. */
export type ContactResult = { ok: true; message: string; name: string; eventType: string; confirmed: boolean } | { ok: false; message?: string; errors?: Record<string, string> };
