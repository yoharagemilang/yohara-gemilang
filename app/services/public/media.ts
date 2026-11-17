// app/services/public/media.ts
// Bentuk media yang dikirim ke halaman publik: hanya yang dibutuhkan untuk membuat URL dan alt.
export type PublicMedia = {
  publicId: string;
  width: number;
  height: number;
  alt: string;
  kind: 'IMAGE' | 'VIDEO';
};

export function pickMedia(m: PublicMedia | null | undefined): PublicMedia | null {
  return m ? { publicId: m.publicId, width: m.width, height: m.height, alt: m.alt, kind: m.kind } : null;
}
