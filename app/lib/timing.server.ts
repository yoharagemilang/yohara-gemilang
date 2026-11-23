// app/lib/timing.server.ts
// Pengukur waktu query per permintaan. Aktif hanya bila DB_TIMING=1; hasilnya tampil di header Server-Timing.
import { AsyncLocalStorage } from 'node:async_hooks';

export const timingEnabled = process.env.DB_TIMING === '1';

type Entry = { name: string; ms: number };
const store = new AsyncLocalStorage<Entry[]>();

export function runWithTiming<T>(fn: () => Promise<T>): Promise<{ result: T; entries: Entry[] }> {
  const entries: Entry[] = [];
  return store.run(entries, async () => ({ result: await fn(), entries }));
}

export async function timed<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const entries = store.getStore();
  if (!entries) return fn();
  const t = performance.now();
  try {
    return await fn();
  } finally {
    entries.push({ name, ms: performance.now() - t });
  }
}

export function serverTiming(entries: Entry[], total: number) {
  const parts = entries.map((e, i) => `q${i}_${e.name.replace(/[^\w]/g, '_')};dur=${e.ms.toFixed(0)}`);
  parts.push(`total;dur=${total.toFixed(0)}`);
  return parts.join(', ');
}
