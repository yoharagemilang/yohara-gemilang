// app/routes/admin/partner.tsx
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { data, useFetcher } from 'react-router';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { ImageUploader } from '~/components/admin/image-uploader';
import { OrderButtons } from '~/components/admin/order-buttons';
import { DragHandle, SortableBody, SortableRow, useOptimisticOrder } from '~/components/admin/sortable-table';
import { useActionToast, useFreshErrors } from '~/components/admin/use-action-feedback';
import { CldImage } from '~/components/cld-image';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { type ActionResult, fieldErrors, firstErrors } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { partnerSchema } from '~/schemas/partner';
import { failure } from '~/services/helpers.server';
import { createPartner, deletePartner, listPartners, movePartner, reorderPartners, setPartnerPublished, updatePartner } from '~/services/partner.server';
import { parseIds } from '~/services/helpers.server';
import type { Route } from './+types/partner';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Partner | Admin Yohara Gemilang' }];
}

export async function loader() {
  const partners = await listPartners();
  return {
    partners: partners.map((p) => ({
      id: p.id,
      name: p.name,
      websiteUrl: p.websiteUrl,
      isPublished: p.isPublished,
      logo: p.logo as MediaItem | null,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');

  if (intent === 'save') {
    const parsed = partnerSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      return data<ActionResult>({ ok: false, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
    }
    const result = id ? await updatePartner(id, parsed.data) : await createPartner(parsed.data);
    if (!result.ok) return data<ActionResult>(failure(result), { status: 400 });
    return data<ActionResult>({ ok: true, message: id ? 'Partner diperbarui' : 'Partner ditambahkan' });
  }

  if (intent === 'reorder') {
    const ids = parseIds(form.get('ids'));
    if (!ids) return data<ActionResult>({ ok: false, message: 'Urutan tidak valid' }, { status: 400 });
    await reorderPartners(ids);
    return data<ActionResult>({ ok: true, message: '' });
  }

  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'toggle') {
    await setPartnerPublished(id, form.get('isPublished') === 'true');
    return data<ActionResult>({ ok: true, message: 'Status diperbarui' });
  }
  if (intent === 'move') {
    await movePartner(id, form.get('dir') === 'up' ? 'up' : 'down');
    return data<ActionResult>({ ok: true, message: 'Urutan diperbarui' });
  }
  if (intent === 'delete') {
    await deletePartner(id);
    return data<ActionResult>({ ok: true, message: 'Partner dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Partner = Route.ComponentProps['loaderData']['partners'][number];

export default function AdminPartner({ loaderData }: Route.ComponentProps) {
  const { partners } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const [editing, setEditing] = useState<Partner | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  useActionToast(fetcher.data, () => setEditing(null));

  const submit = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });
  const { ordered, reorder, move } = useOptimisticOrder(partners, (ids) => submit({ intent: 'reorder', ids: JSON.stringify(ids) }), fetcher.data?.ok === false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Partner</h1>
          <p className="mt-1 text-sm text-muted-foreground">Logo klien dan mitra yang tampil di Beranda. Urutan di sini sama dengan urutan di situs.</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus />
          Tambah partner
        </Button>
      </div>

      {partners.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Belum ada partner</EmptyTitle>
            <EmptyDescription>Tambahkan partner pertama agar tampil di situs.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Urutan</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="w-28">Tampil</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <SortableBody ids={ordered.map((x) => x.id)} onReorder={reorder}>
                {ordered.map((p, i) => (
                  <SortableRow key={p.id} id={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DragHandle label={p.name} />
                        <OrderButtons index={i} total={ordered.length} onMove={(dir) => move(p.id, dir)} />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                          {p.logo ? <CldImage media={p.logo} widths={[96, 192]} sizes="64px" className="size-full object-contain p-1" /> : <ImageIcon className="size-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{p.name}</p>
                          {p.websiteUrl ? (
                            <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-muted-foreground underline-offset-4 hover:underline">
                              {p.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">Tanpa tautan</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Tampilkan ${p.name}`} checked={p.isPublished} onCheckedChange={(checked) => submit({ intent: 'toggle', id: p.id, isPublished: String(checked) })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${p.name}`} onClick={() => setEditing(p)}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${p.name}`} onClick={() => setDeleting(p)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </SortableRow>
                ))}
              </SortableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <PartnerDialog key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')} partner={editing} onClose={() => setEditing(null)} fetcher={fetcher} />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Hapus partner “${deleting?.name ?? ''}”?`}
        description={deleting?.logo ? 'Logonya ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain.' : undefined}
        onConfirm={() => {
          if (deleting) submit({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function PartnerDialog({ partner, onClose, fetcher }: { partner: Partner | 'new' | null; onClose: () => void; fetcher: ReturnType<typeof useFetcher<ActionResult>> }) {
  const current = partner && partner !== 'new' ? partner : null;
  const saving = fetcher.state !== 'idle';
  const errors = useFreshErrors(fetcher.data);
  const [logo, setLogo] = useState<MediaItem | null>(current?.logo ?? null);
  const [published, setPublished] = useState(current?.isPublished ?? true);

  return (
    <Dialog open={partner !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{current ? 'Ubah partner' : 'Tambah partner'}</DialogTitle>
          <DialogDescription>Nama dan logo yang tampil di bagian partner.</DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" id="partner-form" className="-mx-1 min-h-0 overflow-y-auto px-1">
          <input type="hidden" name="intent" value="save" />
          <input type="hidden" name="id" value={current?.id ?? ''} />
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input id="name" name="name" defaultValue={current?.name} maxLength={80} autoFocus aria-invalid={errors.name ? true : undefined} />
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <ImageUploader
              name="logoId"
              label="Logo"
              description="Boleh potret atau persegi. Latar transparan (PNG, SVG) paling rapi"
              value={logo}
              onChange={setLogo}
              orientation="any"
              fit="contain"
              aspect={3 / 2}
              previewClassName="max-w-64"
              error={errors.logoId}
            />

            <Field data-invalid={errors.websiteUrl ? true : undefined}>
              <FieldLabel htmlFor="websiteUrl">Situs web</FieldLabel>
              <Input id="websiteUrl" name="websiteUrl" type="text" inputMode="url" defaultValue={current?.websiteUrl ?? ''} placeholder="https://contoh.com" aria-invalid={errors.websiteUrl ? true : undefined} />
              <FieldDescription>Opsional. Kalau diisi, logo di situs bisa diklik.</FieldDescription>
              {errors.websiteUrl ? <FieldError>{errors.websiteUrl}</FieldError> : null}
            </Field>

            <Field orientation="horizontal">
              <Switch id="isPublished" checked={published} onCheckedChange={setPublished} />
              {published ? <input type="hidden" name="isPublished" value="on" /> : null}
              <FieldLabel htmlFor="isPublished" className="font-normal">
                Tampilkan di situs
              </FieldLabel>
            </Field>
          </FieldGroup>
        </fetcher.Form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="partner-form" disabled={saving}>
            {saving ? <Spinner /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
