// app/schemas/message.ts
import { z } from 'zod';

export const messageStatusSchema = z.enum(['NEW', 'REPLIED', 'ARCHIVED']);
export type MessageStatus = z.infer<typeof messageStatusSchema>;
