// app/lib/db.server.ts
import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '~/generated/prisma/client';

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof createClient>;
};

export const db = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
