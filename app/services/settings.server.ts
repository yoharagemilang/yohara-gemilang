// app/services/settings.server.ts
import { db } from '~/lib/db.server';
import type { SettingsInput } from '~/schemas/settings';

export function getSettings() {
  return db.siteSetting.findUnique({ where: { id: 'main' } });
}

export async function saveSettings(input: SettingsInput) {
  await db.siteSetting.upsert({
    where: { id: 'main' },
    create: { id: 'main', ...input },
    update: input,
  });
}
