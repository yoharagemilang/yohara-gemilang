// app/lib/sanitize.server.ts
// Semua HTML dari editor rich text WAJIB lewat sini sebelum disimpan.
// Hanya tag yang bisa dibuat editor yang diizinkan; sisanya dibuang.
import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'h2', 'h3', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (_tag, attribs) => {
      const href = (attribs.href ?? '').trim();
      // Tautan tanpa alamat jadi teks biasa
      if (!href) return { tagName: 'span', attribs: {} };
      const out: Record<string, string> = { href };
      if (/^https?:\/\//i.test(href)) {
        out.target = '_blank';
        out.rel = 'noopener noreferrer';
      }
      return { tagName: 'a', attribs: out };
    },
  },
};

/** Bersihkan HTML dari editor. Hasil kosong ("") kalau tidak ada teks. */
export function sanitizeRichText(html: string) {
  const clean = sanitizeHtml(html, options)
    // Tautan yang alamatnya dibuang (mis. javascript:) jadi teks biasa
    .replace(/<a>([\s\S]*?)<\/a>/g, '$1')
    // Editor menambah paragraf kosong di akhir dokumen
    .replace(/(<p>\s*(<br\s*\/?>)?\s*<\/p>\s*)+$/g, '')
    .trim();
  const text = clean
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return text === '' ? '' : clean;
}
