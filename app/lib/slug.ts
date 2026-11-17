// app/lib/slug.ts
/** "Resepsi Adat Karo, Aditya & Maharani" -> "resepsi-adat-karo-aditya-dan-maharani" */
export function slugify(text: string, max = 100) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}
