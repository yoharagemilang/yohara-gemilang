// app/routes/admin/tim.tsx
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { data, useFetcher } from 'react-router';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { ImageUploader } from '~/components/admin/image-uploader';
import { OrderButtons } from '~/components/admin/order-buttons';
import { DragHandle, SortableBody, SortableRow, useOptimisticOrder } from '~/components/admin/sortable-table';
import { useActionToast, useFreshErrors } from '~/components/admin/use-action-feedback';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { cldUrl, useCloudName } from '~/lib/cloudinary-url';
import { type ActionResult, fieldErrors, firstErrors } from '~/schemas/common';
import type { MediaItem } from '~/schemas/media';
import { teamSchema } from '~/schemas/team';
import { failure } from '~/services/helpers.server';
import { createMember, deleteMember, listTeam, moveMember, reorderMembers, setMemberPublished, updateMember } from '~/services/team.server';
import { parseIds } from '~/services/helpers.server';
import type { Route } from './+types/tim';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Tim | Admin Yohara Gemilang' }];
}

export async function loader() {
  const members = await listTeam();
  return {
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      bio: m.bio ?? '',
      instagramUrl: m.instagramUrl ?? '',
      linkedinUrl: m.linkedinUrl ?? '',
      isPublished: m.isPublished,
      photo: m.photo as MediaItem | null,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');

  if (intent === 'save') {
    const parsed = teamSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      return data<ActionResult>({ ok: false, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
    }
    const result = id ? await updateMember(id, parsed.data) : await createMember(parsed.data);
    if (!result.ok) return data<ActionResult>(failure(result), { status: 400 });
    return data<ActionResult>({ ok: true, message: id ? 'Anggota tim diperbarui' : 'Anggota tim ditambahkan' });
  }

  if (intent === 'reorder') {
    const ids = parseIds(form.get('ids'));
    if (!ids) return data<ActionResult>({ ok: false, message: 'Urutan tidak valid' }, { status: 400 });
    await reorderMembers(ids);
    return data<ActionResult>({ ok: true, message: '' });
  }

  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'toggle') {
    await setMemberPublished(id, form.get('isPublished') === 'true');
    return data<ActionResult>({ ok: true, message: 'Status diperbarui' });
  }
  if (intent === 'move') {
    await moveMember(id, form.get('dir') === 'up' ? 'up' : 'down');
    return data<ActionResult>({ ok: true, message: 'Urutan diperbarui' });
  }
  if (intent === 'delete') {
    await deleteMember(id);
    return data<ActionResult>({ ok: true, message: 'Anggota tim dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Member = Route.ComponentProps['loaderData']['members'][number];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

function MemberAvatar({ member }: { member: Pick<Member, 'name' | 'photo'> }) {
  const cloud = useCloudName();
  const src = member.photo && cloud ? cldUrl(cloud, member.photo.publicId, { w: 96, h: 96, crop: 'fill', gravity: 'face' }) : null;
  return (
    <Avatar size="lg">
      {src ? <AvatarImage src={src} alt={member.photo?.alt || member.name} /> : null}
      <AvatarFallback>{initials(member.name)}</AvatarFallback>
    </Avatar>
  );
}

export default function AdminTim({ loaderData }: Route.ComponentProps) {
  const { members } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const [editing, setEditing] = useState<Member | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  useActionToast(fetcher.data, () => setEditing(null));

  const submit = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });
  const { ordered, reorder, move } = useOptimisticOrder(members, (ids) => submit({ intent: 'reorder', ids: JSON.stringify(ids) }), fetcher.data?.ok === false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tim</h1>
          <p className="mt-1 text-sm text-muted-foreground">Orang-orang di balik Yohara Gemilang. Urutan di sini sama dengan urutan di situs.</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus />
          Tambah anggota
        </Button>
      </div>

      {members.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Belum ada anggota tim</EmptyTitle>
            <EmptyDescription>Tambahkan anggota pertama agar tampil di halaman Tentang.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Urutan</TableHead>
                  <TableHead>Anggota</TableHead>
                  <TableHead className="w-28">Tampil</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <SortableBody ids={ordered.map((x) => x.id)} onReorder={reorder}>
                {ordered.map((m, i) => (
                  <SortableRow key={m.id} id={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DragHandle label={m.name} />
                        <OrderButtons index={i} total={ordered.length} onMove={(dir) => move(m.id, dir)} />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <MemberAvatar member={m} />
                        <div className="min-w-0">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-muted-foreground">{m.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Tampilkan ${m.name}`} checked={m.isPublished} onCheckedChange={(checked) => submit({ intent: 'toggle', id: m.id, isPublished: String(checked) })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${m.name}`} onClick={() => setEditing(m)}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${m.name}`} onClick={() => setDeleting(m)}>
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

      <MemberDialog key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')} member={editing} onClose={() => setEditing(null)} fetcher={fetcher} />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Hapus ${deleting?.name ?? 'anggota ini'} dari tim?`}
        description={deleting?.photo ? 'Fotonya ikut dihapus dari Cloudinary kalau tidak dipakai di tempat lain.' : undefined}
        onConfirm={() => {
          if (deleting) submit({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function MemberDialog({ member, onClose, fetcher }: { member: Member | 'new' | null; onClose: () => void; fetcher: ReturnType<typeof useFetcher<ActionResult>> }) {
  const current = member && member !== 'new' ? member : null;
  const saving = fetcher.state !== 'idle';
  const errors = useFreshErrors(fetcher.data);
  const [photo, setPhoto] = useState<MediaItem | null>(current?.photo ?? null);
  const [published, setPublished] = useState(current?.isPublished ?? true);

  return (
    <Dialog open={member !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{current ? 'Ubah anggota tim' : 'Tambah anggota tim'}</DialogTitle>
          <DialogDescription>Profil singkat yang tampil di halaman Tentang.</DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" id="member-form" className="-mx-1 min-h-0 overflow-y-auto px-1">
          <input type="hidden" name="intent" value="save" />
          <input type="hidden" name="id" value={current?.id ?? ''} />
          <FieldGroup>
            <ImageUploader name="photoId" label="Foto" description="Boleh potret atau persegi. Wajah di tengah gambar" value={photo} onChange={setPhoto} orientation="any" aspect={1} previewClassName="max-w-48" error={errors.photoId} />

            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input id="name" name="name" defaultValue={current?.name} maxLength={80} aria-invalid={errors.name ? true : undefined} />
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.position ? true : undefined}>
              <FieldLabel htmlFor="position">Jabatan</FieldLabel>
              <Input id="position" name="position" defaultValue={current?.position} maxLength={80} aria-invalid={errors.position ? true : undefined} />
              {errors.position ? <FieldError>{errors.position}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.bio ? true : undefined}>
              <FieldLabel htmlFor="bio">Profil singkat</FieldLabel>
              <Textarea id="bio" name="bio" defaultValue={current?.bio} rows={4} maxLength={500} aria-invalid={errors.bio ? true : undefined} />
              <FieldDescription>Opsional, satu atau dua kalimat.</FieldDescription>
              {errors.bio ? <FieldError>{errors.bio}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.instagramUrl ? true : undefined}>
              <FieldLabel htmlFor="instagramUrl">Instagram</FieldLabel>
              <Input id="instagramUrl" name="instagramUrl" type="text" inputMode="url" defaultValue={current?.instagramUrl} placeholder="https://instagram.com/nama" aria-invalid={errors.instagramUrl ? true : undefined} />
              {errors.instagramUrl ? <FieldError>{errors.instagramUrl}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.linkedinUrl ? true : undefined}>
              <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
              <Input id="linkedinUrl" name="linkedinUrl" type="text" inputMode="url" defaultValue={current?.linkedinUrl} placeholder="https://linkedin.com/in/nama" aria-invalid={errors.linkedinUrl ? true : undefined} />
              {errors.linkedinUrl ? <FieldError>{errors.linkedinUrl}</FieldError> : null}
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
          <Button type="submit" form="member-form" disabled={saving}>
            {saving ? <Spinner /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
