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

/** Teks biasa. Boleh kosong, tetap string (untuk kolom non-null di database). */
export const plainText = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter`);

/** Id media dari input tersembunyi: kosong menjadi null. */
export const optionalId = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v));

/**
 * Tautan http(s) opsional. `hosts` membatasi domain, mis. ["instagram.com"].
 * Subdomain ikut diterima (www.instagram.com).
 */
export const optionalUrl = (hosts?: string[]) =>
  z
    .string()
    .trim()
    .max(300, 'Maksimal 300 karakter')
    .superRefine((v, ctx) => {
      if (v === '') return;
      let url: URL;
      try {
        url = new URL(v);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Gunakan tautan lengkap, contoh https://contoh.com' });
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        ctx.addIssue({ code: 'custom', message: 'Tautan harus diawali https://' });
        return;
      }
      if (hosts) {
        const host = url.hostname.replace(/^www\./, '');
        if (!hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
          ctx.addIssue({ code: 'custom', message: `Tautan harus dari ${hosts.join(' atau ')}` });
        }
      }
    })
    .transform((v) => (v === '' ? null : v));

/** Bentuk hasil action untuk halaman yang memakai dialog + fetcher. */
export type ActionResult = { ok: true; message: string } | { ok: false; message?: string; errors?: Record<string, string> };
