// app/schemas/team.ts
import { z } from 'zod';
import { optionalId, optionalText, optionalUrl, requiredText } from './common';

export const teamSchema = z.object({
  name: requiredText('Nama', 80),
  position: requiredText('Jabatan', 80),
  bio: optionalText(500),
  photoId: optionalId,
  instagramUrl: optionalUrl(['instagram.com']),
  linkedinUrl: optionalUrl(['linkedin.com']),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
});

export type TeamInput = z.infer<typeof teamSchema>;
