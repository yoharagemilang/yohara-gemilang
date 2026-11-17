// app/lib/reading-time.ts
/** Perkiraan menit baca dari HTML (200 kata per menit), minimal 1. */
export function readingMinutes(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
