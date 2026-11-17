// app/schemas/faq.ts
import { z } from 'zod';
import { requiredText } from './common';

export const faqSchema = z.object({
  question: requiredText('Pertanyaan', 200),
  answer: requiredText('Jawaban', 1500),
  isPublished: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
});

export type FaqInput = z.infer<typeof faqSchema>;
