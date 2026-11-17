// app/schemas/common.ts
import { z } from 'zod';

/** Teks opsional: kosong menjadi null. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .transform((v) => (v === '' ? null : v));

export const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} wajib diisi`).max(max, `Maksimal ${max} karakter`);

/** Tautan internal (/kontak), anchor (#layanan), atau eksternal (https, mailto, tel). */
export const linkHref = z
  .string()
  .trim()
  .max(300, 'Maksimal 300 karakter')
  .refine((v) => /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(v), 'Gunakan tautan seperti /kontak, #layanan, atau https://...');

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}

/** Ambil pesan pertama tiap kolom untuk ditampilkan di form. */
export function firstErrors(errors?: FieldErrors) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(errors ?? {})) if (v?.[0]) out[k] = v[0];
  return out;
}
