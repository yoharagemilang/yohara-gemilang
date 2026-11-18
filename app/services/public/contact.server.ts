// app/services/public/contact.server.ts
import { db } from '~/lib/db.server';
import { confirmationMail, notificationMail } from '~/lib/mail-templates.server';
import { mailRecipients, sendMail } from '~/lib/mail.server';
import type { ContactInput } from '~/schemas/contact';
import { getSettings } from '../settings.server';

/** Pilihan "Jenis acara" di formulir: seluruh layanan terbit, ditambah "Lainnya". */
export async function getContactOptions() {
  const rows: { title: string }[] = await db.service.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { title: true },
  });
  return { eventTypes: [...rows.map((r) => r.title), 'Lainnya'] };
}

/**
 * Simpan pesan, lalu kirim email. Penyimpanan wajib berhasil (error dilempar ke pemanggil);
 * email bersifat tambahan: gagal tidak membatalkan pesan yang sudah tersimpan.
 */
export async function submitContact(input: ContactInput, origin: string) {
  await db.contactMessage.create({
    data: {
      name: input.name,
      whatsapp: input.whatsapp,
      email: input.email,
      eventType: input.eventType,
      eventDate: input.eventDate,
      message: input.message,
    },
  });

  const s = await getSettings();
  const company = s?.companyName ?? 'Yohara Gemilang Management';
  const recipients = mailRecipients();

  const [notified, confirmed] = await Promise.all([
    recipients.length
      ? (async () => {
          const mail = notificationMail(input, { company, adminUrl: `${origin}/admin/pesan` });
          return sendMail({ to: recipients, ...mail, replyTo: input.email ?? undefined });
        })()
      : Promise.resolve({ ok: false }),
    input.email
      ? (async () => {
          const mail = confirmationMail(input, {
            company,
            openingHours: s?.openingHours ?? '',
            whatsapp: s?.whatsapp ?? '',
            address: s?.address ?? '',
          });
          return sendMail({ to: input.email!, ...mail, replyTo: recipients[0] });
        })()
      : Promise.resolve({ ok: false }),
  ]);

  return { notified: notified.ok, confirmed: confirmed.ok };
}
