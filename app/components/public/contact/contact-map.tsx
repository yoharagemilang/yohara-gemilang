// app/components/public/contact/contact-map.tsx
// Peta Google Maps (embed tanpa API key) dari kata kunci di pengaturan. Dimuat malas agar halaman tetap ringan.
export function ContactMap({ query, title }: { query: string; title: string }) {
  if (!query.trim()) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <div>
      <div className="aspect-4/3 overflow-hidden rounded-xl border border-line bg-soft md:aspect-16/10">
        <iframe src={src} title={`Peta lokasi ${title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
      </div>
      <a href={open} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[0.9rem] font-medium underline-offset-4 hover:text-brand hover:underline">
        Buka di Google Maps
      </a>
    </div>
  );
}
