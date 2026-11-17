// app/schemas/partner.ts
import { z } from 'zod';
import { optionalId, optionalUrl, requiredText } from './common';

export const partnerSchema = z.object({
  name: requiredText('Nama', 80),
  logoId: optionalId,
  websiteUrl: optionalUrl(),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
