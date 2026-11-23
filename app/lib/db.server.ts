// app/lib/db.server.ts
import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '~/generated/prisma/client';
import { timed, timingEnabled } from './timing.server';

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const adapter = new PrismaNeon({ connectionString });
  const client = new PrismaClient({ adapter });
  if (!timingEnabled) return client;
  return client.$extends({
    query: {
      $allOperations: ({ model, operation, args, query }) => timed(`${model ?? 'raw'}_${operation}`, () => query(args)),
    },
  }) as unknown as typeof client;
}

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof createClient>;
};

export const db = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
