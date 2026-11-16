// app/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Format email tidak valid')),
  password: z.string().min(1, 'Password wajib diisi').max(200, 'Password terlalu panjang'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Hanya izinkan redirect ke dalam /admin, cegah open redirect. */
export function safeAdminPath(value: FormDataEntryValue | string | null) {
  if (typeof value !== 'string') return '/admin';
  if (!value.startsWith('/admin') || value.startsWith('//')) return '/admin';
  if (value.startsWith('/admin/login')) return '/admin';
  return value;
}
