// app/lib/format.ts
// Format tampilan untuk situs publik. Zona waktu dikunci (UTC) agar server dan browser sama.
const dateLong = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const number = new Intl.NumberFormat('id-ID');

export function formatDateId(iso: string) {
  return dateLong.format(new Date(iso));
}

export function formatNumberId(n: number) {
  return number.format(n);
}
