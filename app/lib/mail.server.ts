// app/lib/mail.server.ts

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type MailResult = { ok: boolean; skipped?: boolean };

const TIMEOUT_MS = 8000;

/** Alamat penerima notifikasi untuk CV, dari MAIL_TO. */
export function mailRecipients(): string[] {
  return (process.env.MAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendMail(mail: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!key || !from) {
    console.info(`[mail] dilewati (RESEND_API_KEY/MAIL_FROM belum diisi): "${mail.subject}" -> ${[mail.to].flat().join(', ')}`);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mail.to].flat(),
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[mail] Resend menolak (${res.status}): ${(await res.text()).slice(0, 300)}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error('[mail] gagal terkirim:', error);
    return { ok: false };
  }
}
