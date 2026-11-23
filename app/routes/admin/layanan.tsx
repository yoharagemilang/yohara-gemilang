// app/routes/admin/layanan.tsx
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { data, useFetcher } from 'react-router';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog';
import { OrderButtons } from '~/components/admin/order-buttons';
import { useActionToast } from '~/components/admin/use-action-feedback';
import { DragHandle, SortableBody, SortableRow, useOptimisticOrder } from '~/components/admin/sortable-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { getServiceIcon, serviceIconOptions } from '~/lib/icons';
import { fieldErrors, firstErrors } from '~/schemas/common';
import { serviceSchema } from '~/schemas/service';
import { createService, deleteService, listServices, moveService, reorderServices, setServicePublished, updateService } from '~/services/service.server';
import { parseIds } from '~/services/helpers.server';
import type { Route } from './+types/layanan';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Layanan | Admin Yohara Gemilang' }];
}

export async function loader() {
  const services = await listServices();
  return {
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      iconKey: s.iconKey,
      isPublished: s.isPublished,
      projects: s._count.projects,
    })),
  };
}

type ActionResult = { ok: true; message: string } | { ok: false; message?: string; errors?: Record<string, string> };

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');

  if (intent === 'save') {
    const parsed = serviceSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      return data<ActionResult>({ ok: false, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
    }
    if (id) {
      await updateService(id, parsed.data);
      return data<ActionResult>({ ok: true, message: 'Layanan diperbarui' });
    }
    await createService(parsed.data);
    return data<ActionResult>({ ok: true, message: 'Layanan ditambahkan' });
  }

  if (intent === 'reorder') {
    const ids = parseIds(form.get('ids'));
    if (!ids) return data<ActionResult>({ ok: false, message: 'Urutan tidak valid' }, { status: 400 });
    await reorderServices(ids);
    return data<ActionResult>({ ok: true, message: '' });
  }

  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'toggle') {
    await setServicePublished(id, form.get('isPublished') === 'true');
    return data<ActionResult>({ ok: true, message: 'Status diperbarui' });
  }
  if (intent === 'move') {
    await moveService(id, form.get('dir') === 'up' ? 'up' : 'down');
    return data<ActionResult>({ ok: true, message: 'Urutan diperbarui' });
  }
  if (intent === 'delete') {
    await deleteService(id);
    return data<ActionResult>({ ok: true, message: 'Layanan dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Service = Route.ComponentProps['loaderData']['services'][number];

export default function AdminLayanan({ loaderData }: Route.ComponentProps) {
  const { services } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  useActionToast(fetcher.data, () => setEditing(null));

  const submit = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });
  const { ordered, reorder, move } = useOptimisticOrder(services, (ids) => submit({ intent: 'reorder', ids: JSON.stringify(ids) }), fetcher.data?.ok === false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Layanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar layanan di Beranda dan halaman Layanan. Urutan di sini sama dengan urutan di situs.</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus />
          Tambah layanan
        </Button>
      </div>

      {services.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Belum ada layanan</EmptyTitle>
            <EmptyDescription>Tambahkan layanan pertama agar tampil di situs.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Urutan</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead className="w-24">Proyek</TableHead>
                  <TableHead className="w-28">Tampil</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <SortableBody ids={ordered.map((x) => x.id)} onReorder={reorder}>
                {ordered.map((s, i) => {
                  const Icon = getServiceIcon(s.iconKey);
                  return (
                    <SortableRow key={s.id} id={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DragHandle label={s.title} />
                          <OrderButtons index={i} total={ordered.length} onMove={(dir) => move(s.id, dir)} />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-muted">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">{s.title}</p>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.projects}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch aria-label={`Tampilkan ${s.title}`} checked={s.isPublished} onCheckedChange={(checked) => submit({ intent: 'toggle', id: s.id, isPublished: String(checked) })} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${s.title}`} onClick={() => setEditing(s)}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${s.title}`} onClick={() => setDeleting(s)}>
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </SortableRow>
                  );
                })}
              </SortableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ServiceDialog key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')} service={editing} onClose={() => setEditing(null)} fetcher={fetcher} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus layanan “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deleting.projects > 0 ? `${deleting.projects} proyek portofolio memakai layanan ini. Proyeknya tetap ada, tapi tanpa layanan. ` : ''}
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleting) submit({ intent: 'delete', id: deleting.id });
                setDeleting(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceDialog({ service, onClose, fetcher }: { service: Service | 'new' | null; onClose: () => void; fetcher: ReturnType<typeof useFetcher<ActionResult>> }) {
  const current = service && service !== 'new' ? service : null;
  const saving = fetcher.state !== 'idle';
  // Abaikan hasil lama dari sesi dialog sebelumnya (komponen dibuat ulang tiap dibuka)
  const initialData = useRef(fetcher.data);
  const fresh = fetcher.data !== initialData.current;
  const errors = fresh && fetcher.data && !fetcher.data.ok ? (fetcher.data.errors ?? {}) : {};
  const [icon, setIcon] = useState<string>(current?.iconKey ?? 'briefcase');
  const [published, setPublished] = useState(current?.isPublished ?? true);

  return (
    <Dialog open={service !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{current ? 'Ubah layanan' : 'Tambah layanan'}</DialogTitle>
          <DialogDescription>Judul dan deskripsi singkat yang tampil di kartu layanan.</DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" id="service-form">
          <input type="hidden" name="intent" value="save" />
          <input type="hidden" name="id" value={current?.id ?? ''} />
          <FieldGroup>
            <Field data-invalid={errors.title ? true : undefined}>
              <FieldLabel htmlFor="title">Judul</FieldLabel>
              <Input id="title" name="title" defaultValue={current?.title} maxLength={80} autoFocus aria-invalid={errors.title ? true : undefined} />
              {errors.title ? <FieldError>{errors.title}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.description ? true : undefined}>
              <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
              <Textarea id="description" name="description" defaultValue={current?.description} rows={4} maxLength={400} aria-invalid={errors.description ? true : undefined} />
              {errors.description ? <FieldError>{errors.description}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.iconKey ? true : undefined}>
              <FieldLabel>Ikon</FieldLabel>
              <Select name="iconKey" items={serviceIconOptions} value={icon} onValueChange={(v) => v && setIcon(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceIconOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.iconKey ? <FieldError>{errors.iconKey}</FieldError> : null}
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
          <Button type="submit" form="service-form" disabled={saving}>
            {saving ? <Spinner /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
