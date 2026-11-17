// app/lib/image-rules.ts
// Aturan bentuk gambar. Dipakai di browser (sebelum unggah) dan server (setelah unggah).

/** landscape = wajib lebih lebar dari tinggi. any = bebas (logo, foto tim, dll). */
export type Orientation = 'landscape' | 'any';

/** 4:3 (1,33), 3:2 (1,5), 16:9 (1,78) lolos. Persegi dan potret ditolak. */
export const MIN_LANDSCAPE_RATIO = 1.2;

export function isLandscape(width: number, height: number) {
  return height > 0 && width / height >= MIN_LANDSCAPE_RATIO;
}

/** Batas video hero. Diperiksa di browser dan diperiksa ulang di server. */
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 20;
export const MAX_HERO_SLIDES = 5;

export type MediaKindName = 'IMAGE' | 'VIDEO';

export const LANDSCAPE_HINT = 'Landscape, ideal 16:9 (contoh 1920×1080)';

export const LANDSCAPE_ERROR = 'Gambar harus landscape (lebar jauh lebih besar dari tinggi), ideal 16:9 seperti 1920×1080.';
