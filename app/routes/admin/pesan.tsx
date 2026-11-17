// app/routes/admin/pesan.tsx
import { Eye, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, Link, data, useFetcher, useSubmit } from 'react-router';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { useActionToast } from '~/components/admin/use-action-feedback';
import { Badge } from '~/components/ui/badge';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { waLink } from '~/lib/contact';
import type { ActionResult } from '~/schemas/common';
import { type MessageStatus, messageStatusSchema } from '~/schemas/message';
import { deleteMessage, listMessages, markMessageRead, setMessageStatus } from '~/services/message.server';
import { getSettings } from '~/services/settings.server';
import type { Route } from './+types/pesan';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Pesan | Admin Yohara Gemilang' }];
}

const PAGE = 50;

const statusItems = [
  { value: 'all', label: 'Semua status' },
  { value: 'NEW', label: 'Baru' },
  { value: 'REPLIED', label: 'Sudah dibalas' },
  { value: 'ARCHIVED', label: 'Arsip' },
];

const statusLabel: Record<MessageStatus, string> = {
  NEW: 'Baru',
  REPLIED: 'Dibalas',
  ARCHIVED: 'Arsip',
};

// Zona waktu dikunci supaya server dan browser menampilkan hasil yang sama
const dateTime = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
});
const dateOnly = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC', // kolom tanggal acara tersimpan tanpa jam
});
const shortDate = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim().slice(0, 80) || undefined;
  const parsedStatus = messageStatusSchema.safeParse(url.searchParams.get('status'));
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const take = Math.min(Math.max(Number(url.searchParams.get('take')) || PAGE, PAGE), 500);

  const [rows, settings] = await Promise.all([listMessages({ q, status, take }), getSettings()]);
  const page = rows.slice(0, take);

  return {
    q: q ?? '',
    status: status ?? 'all',
    take,
    hasMore: rows.length > take,
    companyName: settings?.companyName ?? 'kami',
    messages: page.map((m) => ({
      id: m.id,
      name: m.name,
      whatsapp: m.whatsapp,
      email: m.email,
      eventType: m.eventType,
      eventDate: m.eventDate ? m.eventDate.toISOString() : null,
      message: m.message,
      status: m.status as MessageStatus,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');
  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'read') {
    await markMessageRead(id);
    return data<ActionResult>({ ok: true, message: '' });
  }
  if (intent === 'status') {
    const status = messageStatusSchema.safeParse(form.get('status'));
    if (!status.success) {
      return data<ActionResult>({ ok: false, message: 'Status tidak dikenal' }, { status: 400 });
    }
    await setMessageStatus(id, status.data);
    return data<ActionResult>({ ok: true, message: `Pesan ditandai: ${statusLabel[status.data]}` });
  }
  if (intent === 'delete') {
    await deleteMessage(id);
    return data<ActionResult>({ ok: true, message: 'Pesan dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Message = Route.ComponentProps['loaderData']['messages'][number];

function StatusBadge({ status }: { status: MessageStatus }) {
  return <Badge variant={status === 'NEW' ? 'default' : status === 'REPLIED' ? 'secondary' : 'outline'}>{statusLabel[status]}</Badge>;
}

export default function AdminPesan({ loaderData }: Route.ComponentProps) {
  const { messages, q, status, take, hasMore, companyName } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const readFetcher = useFetcher<ActionResult>();
  const submit = useSubmit();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);

  useActionToast(fetcher.data);

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const act = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });

  // Membuka pesan menandainya sudah dibaca (tanpa mengubah status)
  const selectedUnread = selected && !selected.readAt ? selected.id : null;
  useEffect(() => {
    if (selectedUnread) readFetcher.submit({ intent: 'read', id: selectedUnread }, { method: 'post' });
  }, [selectedUnread]);

  const filtered = q !== '' || status !== 'all';
  const moreParams = new URLSearchParams();
  if (q) moreParams.set('q', q);
  if (status !== 'all') moreParams.set('status', status);
  moreParams.set('take', String(take + PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pesan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pesan dari formulir kontak di situs. Balas lewat WhatsApp, lalu tandai sudah dibalas.</p>
      </div>

      <Form method="get" className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Cari nama, nomor, atau email" aria-label="Cari pesan" className="pl-8" />
        </div>
        <Select
          items={statusItems}
          value={status}
          onValueChange={(v) => {
            if (!v) return;
            const next = new URLSearchParams();
            if (q) next.set('q', q);
            if (v !== 'all') next.set('status', v);
            submit(next);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">
          Cari
        </Button>
      </Form>

      {messages.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{filtered ? 'Tidak ada pesan yang cocok' : 'Belum ada pesan'}</EmptyTitle>
            <EmptyDescription>{filtered ? 'Ubah kata kunci atau filter status.' : 'Pesan dari formulir kontak akan muncul di sini.'}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengirim</TableHead>
                  <TableHead>Acara</TableHead>
                  <TableHead className="w-36">Diterima</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-normal">
                      <Button variant="link" className={`h-auto p-0 ${m.readAt ? 'font-medium' : 'font-bold'}`} onClick={() => setSelectedId(m.id)}>
                        {m.name}
                      </Button>
                      <p className="text-sm text-muted-foreground">{m.whatsapp}</p>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p>{m.eventType}</p>
                      {m.eventDate ? <p className="text-sm text-muted-foreground">{dateOnly.format(new Date(m.eventDate))}</p> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{shortDate.format(new Date(m.createdAt))}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" aria-label={`Buka pesan ${m.name}`} onClick={() => setSelectedId(m.id)}>
                        <Eye />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus pesan ${m.name}`} onClick={() => setDeleting(m)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Link to={`?${moreParams.toString()}`} className={buttonVariants({ variant: 'outline' })}>
            Muat lainnya
          </Link>
        </div>
      ) : null}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>Diterima {dateTime.format(new Date(selected.createdAt))}</SheetDescription>
              </SheetHeader>

              <dl className="space-y-4 px-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={selected.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd className="font-medium">{selected.whatsapp}</dd>
                </div>
                {selected.email ? (
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>
                      <a href={`mailto:${selected.email}`} className="font-medium underline-offset-4 hover:underline">
                        {selected.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Jenis acara</dt>
                  <dd className="font-medium">{selected.eventType}</dd>
                </div>
                {selected.eventDate ? (
                  <div>
                    <dt className="text-muted-foreground">Tanggal acara</dt>
                    <dd className="font-medium">{dateOnly.format(new Date(selected.eventDate))}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Pesan</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{selected.message || 'Tidak ada pesan tambahan.'}</dd>
                </div>
              </dl>

              <SheetFooter>
                <a
                  href={waLink(selected.whatsapp, `Halo ${selected.name}, terima kasih sudah menghubungi ${companyName}. Kami menerima pesan Anda tentang acara ${selected.eventType}. Boleh kami tahu kebutuhan lengkapnya?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants()}
                >
                  Balas via WhatsApp
                </a>
                {selected.status !== 'REPLIED' ? (
                  <Button variant="outline" onClick={() => act({ intent: 'status', id: selected.id, status: 'REPLIED' })}>
                    Tandai sudah dibalas
                  </Button>
                ) : null}
                {selected.status !== 'ARCHIVED' ? (
                  <Button variant="outline" onClick={() => act({ intent: 'status', id: selected.id, status: 'ARCHIVED' })}>
                    Arsipkan
                  </Button>
                ) : null}
                {selected.status !== 'NEW' ? (
                  <Button variant="outline" onClick={() => act({ intent: 'status', id: selected.id, status: 'NEW' })}>
                    Kembalikan ke Baru
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setDeleting(selected)}>
                  <Trash2 />
                  Hapus pesan
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Hapus pesan dari ${deleting?.name ?? ''}?`}
        onConfirm={() => {
          if (deleting) act({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}
