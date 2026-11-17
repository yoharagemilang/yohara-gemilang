// app/lib/contact.ts
// Dipakai di admin (membalas pesan) dan nanti di situs publik (tombol WhatsApp).

/** "0812-6047-3391", "+62 812 6047 3391", atau "812..." menjadi "628126047..." */
export function waNumber(raw: string) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return digits;
}

export function waLink(raw: string, text?: string) {
  const base = `https://wa.me/${waNumber(raw)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
