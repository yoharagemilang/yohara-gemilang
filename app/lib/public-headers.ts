// app/lib/public-headers.ts
// Halaman publik boleh di-cache CDN selama 60 detik (lalu disajikan sambil diperbarui di latar).
// Admin tidak memakai ini: respons admin tidak pernah di-cache.
export function publicHeaders() {
  return {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
  };
}
