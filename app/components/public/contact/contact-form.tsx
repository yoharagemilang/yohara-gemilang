// app/components/public/contact/contact-form.tsx
// Formulir kontak. Selalu dikirim ke action /kontak, jadi bisa dipakai di beranda dan halaman Kontak.
// Dikirim lewat fetcher (halaman tidak pindah), error tampil per kolom,
// hasil tampil sebagai toast berwarna dan layar sukses.
import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import type { ContactResult } from '~/schemas/contact';
import type { SiteInfo } from '~/services/site.server';
import { cta } from '../shared/cta';
import { ContactSuccess } from './contact-success';
import { inputClass, labelClass, textareaClass } from './field-styles';

function Required() {
  return (
    <span aria-hidden className="ml-0.5 text-brand">
      *
    </span>
  );
}

export function ContactForm({ site, eventTypes }: { site: SiteInfo; eventTypes: string[] }) {
  const fetcher = useFetcher<ContactResult>();
  const result = fetcher.data;
  const pending = fetcher.state !== 'idle';

  // "Kirim pesan lain": hasil lama diabaikan dan form dibuat ulang agar kolomnya kosong.
  const [dismissed, setDismissed] = useState<ContactResult | undefined>();
  const [formKey, setFormKey] = useState(0);

  const handled = useRef<ContactResult | undefined>(undefined);
  useEffect(() => {
    if (!result || handled.current === result) return;
    handled.current = result;
    if (result.ok) toast.success('Pesan terkirim. Terima kasih!');
    else if (result.message) toast.error(result.message);
  }, [result]);

  if (result?.ok && result !== dismissed) {
    return (
      <ContactSuccess
        site={site}
        name={result.name}
        eventType={result.eventType}
        confirmed={result.confirmed}
        onReset={() => {
          setDismissed(result);
          setFormKey((k) => k + 1);
        }}
      />
    );
  }

  const errors = result && !result.ok ? (result.errors ?? {}) : {};
  const invalid = (k: string) => (errors[k] ? true : undefined);
  const items = eventTypes.map((v) => ({ value: v, label: v }));

  return (
    <fetcher.Form key={formKey} method="post" action="/kontak" noValidate className="flex flex-1 flex-col">
      <FieldGroup className="flex-1 gap-5">
        <Field data-invalid={invalid('name')}>
          <FieldLabel htmlFor="name" className={labelClass}>
            Nama lengkap <Required />
          </FieldLabel>
          <Input id="name" name="name" autoComplete="name" maxLength={80} placeholder="Nama Anda" aria-invalid={invalid('name')} aria-required className={inputClass} />
          {errors.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={invalid('whatsapp')}>
            <FieldLabel htmlFor="whatsapp" className={labelClass}>
              Nomor WhatsApp <Required />
            </FieldLabel>
            <Input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="0812-3456-7890" aria-invalid={invalid('whatsapp')} aria-required className={inputClass} />
            {errors.whatsapp ? <FieldError>{errors.whatsapp}</FieldError> : null}
          </Field>
          <Field data-invalid={invalid('email')}>
            <FieldLabel htmlFor="email" className={labelClass}>
              Email <span className="ml-1.5 font-normal text-mute">(opsional)</span>
            </FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" maxLength={120} placeholder="nama@email.com" aria-invalid={invalid('email')} className={inputClass} />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={invalid('eventType')}>
            <FieldLabel htmlFor="eventType" className={labelClass}>
              Jenis acara <Required />
            </FieldLabel>
            <Select name="eventType" items={items}>
              <SelectTrigger id="eventType" aria-invalid={invalid('eventType')} className={`${inputClass} w-full`}>
                <SelectValue placeholder="Pilih jenis acara" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType ? <FieldError>{errors.eventType}</FieldError> : null}
          </Field>
          <Field data-invalid={invalid('eventDate')}>
            <FieldLabel htmlFor="eventDate" className={labelClass}>
              Perkiraan tanggal <span className="ml-1.5 font-normal text-mute">(opsional)</span>
            </FieldLabel>
            <Input id="eventDate" name="eventDate" type="date" aria-invalid={invalid('eventDate')} className={inputClass} />
            {errors.eventDate ? <FieldError>{errors.eventDate}</FieldError> : null}
          </Field>
        </div>

        <Field data-invalid={invalid('message')} className="flex-1">
          <FieldLabel htmlFor="message" className={labelClass}>
            Ceritakan rencana acara Anda <span className="ml-1.5 font-normal text-mute">(opsional)</span>
          </FieldLabel>
          <Textarea id="message" name="message" rows={5} maxLength={2000} placeholder="Jumlah tamu, lokasi, anggaran, atau hal lain yang perlu kami tahu." aria-invalid={invalid('message')} className={textareaClass} />
          {errors.message ? <FieldError>{errors.message}</FieldError> : null}
        </Field>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[38ch] text-[0.82rem] text-mute">
            Dengan mengirim, Anda menyetujui{' '}
            <Link to="/kebijakan-privasi" className="underline underline-offset-4 hover:text-brand">
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>
          <Button type="submit" disabled={pending} className={cta('red', 'w-full sm:w-auto')}>
            {pending ? (
              <>
                <Spinner aria-hidden className="size-4" />
                Mengirim...
              </>
            ) : (
              'Kirim pesan'
            )}
          </Button>
        </div>
      </FieldGroup>
    </fetcher.Form>
  );
}
