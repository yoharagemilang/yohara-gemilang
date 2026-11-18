// app/components/public/legal/legal-types.ts
export type LegalBlock = string | { list: string[] };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };

/** Ubah tanggal ini setiap kali isi kebijakan atau ketentuan diperbarui. */
export const LEGAL_UPDATED = '2026-11-18';
