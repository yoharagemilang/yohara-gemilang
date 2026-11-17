// app/schemas/service.ts
import { z } from 'zod';
import { serviceIconKeys } from '~/lib/icons';
import { requiredText } from './common';

export const serviceSchema = z.object({
  title: requiredText('Judul', 80),
  description: requiredText('Deskripsi', 400),
  iconKey: z.enum(serviceIconKeys, 'Pilih ikon'),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
