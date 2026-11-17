// app/schemas/media.ts
import { z } from 'zod';

export type MediaItem = {
  id: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
  kind: 'IMAGE' | 'VIDEO';
  /** detik, hanya untuk video */
  duration: number | null;
};

export type MediaListItem = MediaItem & { usage: number };

export const mediaActionSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('create'),
    publicId: z.string().min(1).max(300),
    alt: z.string().trim().max(200).default(''),
    orientation: z.enum(['landscape', 'any']).default('any'),
    kind: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  }),
  z.object({
    intent: z.literal('alt'),
    id: z.string().min(1),
    alt: z.string().trim().max(200),
  }),
  z.object({
    intent: z.literal('delete'),
    id: z.string().min(1),
  }),
]);

export type MediaActionInput = z.infer<typeof mediaActionSchema>;
