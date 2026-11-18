// app/lib/mail-templates.server.ts
// Isi email: notifikasi untuk CV dan konfirmasi untuk pengirim. HTML dibuat sederhana dan
// bergaya inline supaya tampil sama di Gmail, Outlook, dan aplikasi email di ponsel.
import { waLink } from '~/lib/contact';
import { formatDateId } from '~/lib/format';
import type { ContactInput } from '~/schemas/contact';

const INK = '#121212';
const BRAND = '#c8202e';
const MUTE = '#64635f';
const LINE = '#e3e1dd';

function esc(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function button(href: string, label: string, dark = false) {
  const bg = dark ? INK : BRAND;
  return `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px;margin:0 8px 8px 0">${esc(label)}</a>`;
}

function layout(company: string, body: string, footer: string) {
  return `<!doctype html><html lang="id"><body style="margin:0;background:#f5f4f2;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:12px">
<tr><td style="padding:22px 28px;border-bottom:1px solid ${LINE};font-weight:700;font-size:15px">${esc(company)}<span style="color:${BRAND}">.</span></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTE}">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};width:130px;font-size:13px;color:${MUTE};vertical-align:top">${esc(label)}</td><td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;vertical-align:top;white-space:pre-line">${value}</td></tr>`;
}

function details(m: ContactInput) {
  const rows = [
    row('Nama', esc(m.name)),
    row('WhatsApp', esc(m.whatsapp)),
    ...(m.email ? [row('Email', esc(m.email))] : []),
    row('Jenis acara', esc(m.eventType)),
    ...(m.eventDate ? [row('Tanggal acara', esc(formatDateId(m.eventDate.toISOString())))] : []),
    ...(m.message ? [row('Pesan', esc(m.message))] : []),
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE}">${rows.join('')}</table>`;
}

function detailsText(m: ContactInput) {
  return [`Nama: ${m.name}`, `WhatsApp: ${m.whatsapp}`, m.email && `Email: ${m.email}`, `Jenis acara: ${m.eventType}`, m.eventDate && `Tanggal acara: ${formatDateId(m.eventDate.toISOString())}`, m.message && `Pesan:\n${m.message}`]
    .filter(Boolean)
    .join('\n');
}

/** Untuk CV: pesan baru dari formulir. Reply-To diisi email pengunjung (bila ada) oleh pemanggil. */
export function notificationMail(m: ContactInput, { company, adminUrl }: { company: string; adminUrl: string }) {
  const reply = waLink(m.whatsapp, `Halo ${m.name}, terima kasih sudah menghubungi ${company}. Kami menerima pesan Anda tentang acara ${m.eventType}. Boleh kami tahu kebutuhan lengkapnya?`);
  const html = layout(
    company,
    `<h1 style="margin:0 0 6px;font-size:20px;line-height:1.3">Pesan baru dari formulir kontak</h1>
<p style="margin:0 0 22px;font-size:14px;color:${MUTE}">${esc(m.name)} menanyakan acara ${esc(m.eventType)}.</p>
${details(m)}
<div style="margin-top:26px">${button(reply, 'Balas lewat WhatsApp')}${button(adminUrl, 'Buka di admin', true)}</div>`,
    `Email ini dikirim otomatis dari formulir kontak situs. Pesan juga tersimpan di menu Pesan pada admin.`,
  );
  const text = `Pesan baru dari formulir kontak\n\n${detailsText(m)}\n\nBalas lewat WhatsApp: ${reply}\nBuka di admin: ${adminUrl}`;
  return { subject: `Pesan baru: ${m.name} · ${m.eventType}`, html, text };
}

/** Untuk pengirim: tanda terima. Hanya dikirim bila ia mengisi email. */
export function confirmationMail(m: ContactInput, { company, openingHours, whatsapp, address }: { company: string; openingHours: string; whatsapp: string; address: string }) {
  const hours = openingHours ? ` pada jam kerja kami (${openingHours})` : '';
  const chat = whatsapp ? waLink(whatsapp, `Halo ${company}, saya ${m.name}. Saya sudah mengirim pesan lewat website untuk acara ${m.eventType}.`) : '';
  const html = layout(
    company,
    `<h1 style="margin:0 0 14px;font-size:20px;line-height:1.3">Pesan Anda sudah kami terima</h1>
<p style="margin:0 0 14px;font-size:14px;line-height:1.7">Halo ${esc(m.name)}, terima kasih sudah menghubungi ${esc(company)}. Tim kami akan menghubungi Anda lewat WhatsApp di ${esc(m.whatsapp)}${esc(hours)}.</p>
<p style="margin:0 0 10px;font-size:13px;color:${MUTE}">Ringkasan pesan Anda:</p>
${details(m)}
${chat ? `<div style="margin-top:26px"><p style="margin:0 0 12px;font-size:14px">Butuh jawaban lebih cepat?</p>${button(chat, 'Chat WhatsApp', true)}</div>` : ''}`,
    `Email ini dikirim otomatis karena alamat Anda diisi pada formulir kontak ${esc(company)}.${address ? `<br>${esc(address)}` : ''}`,
  );
  const text = `Halo ${m.name},\n\nTerima kasih sudah menghubungi ${company}. Tim kami akan menghubungi Anda lewat WhatsApp di ${m.whatsapp}${hours}.\n\nRingkasan pesan Anda:\n${detailsText(m)}${chat ? `\n\nButuh jawaban lebih cepat? ${chat}` : ''}`;
  return { subject: `Pesan Anda sudah kami terima | ${company}`, html, text };
}
