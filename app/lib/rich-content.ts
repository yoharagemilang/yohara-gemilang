// app/lib/rich-content.ts
// Gaya untuk isi rich text. Dipakai editor di admin dan nanti halaman publik,
// supaya tampilan di editor sama dengan di situs.
export const richContentClass = [
  'text-sm leading-relaxed',
  '[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:leading-snug [&_h2]:font-bold [&_h2:first-child]:mt-0',
  '[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:leading-snug [&_h3]:font-semibold [&_h3:first-child]:mt-0',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic',
  '[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4',
].join(' ');
