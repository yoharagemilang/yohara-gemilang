// app/routes/admin/faq.tsx
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { data, useFetcher } from 'react-router';

import { ConfirmDelete } from '~/components/admin/confirm-delete';
import { OrderButtons } from '~/components/admin/order-buttons';
import { useActionToast, useFreshErrors } from '~/components/admin/use-action-feedback';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { type ActionResult, fieldErrors, firstErrors } from '~/schemas/common';
import { faqSchema } from '~/schemas/faq';
import { createFaq, deleteFaq, listFaqs, moveFaq, setFaqPublished, updateFaq } from '~/services/faq.server';
import type { Route } from './+types/faq';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'FAQ | Admin Yohara Gemilang' }];
}

export async function loader() {
  const faqs = await listFaqs();
  return {
    faqs: faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      isPublished: f.isPublished,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '');

  if (intent === 'save') {
    const parsed = faqSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      return data<ActionResult>({ ok: false, errors: firstErrors(fieldErrors(parsed.error)) }, { status: 400 });
    }
    if (id) {
      await updateFaq(id, parsed.data);
      return data<ActionResult>({ ok: true, message: 'FAQ diperbarui' });
    }
    await createFaq(parsed.data);
    return data<ActionResult>({ ok: true, message: 'FAQ ditambahkan' });
  }

  if (!id) return data<ActionResult>({ ok: false, message: 'Data tidak valid' }, { status: 400 });

  if (intent === 'toggle') {
    await setFaqPublished(id, form.get('isPublished') === 'true');
    return data<ActionResult>({ ok: true, message: 'Status diperbarui' });
  }
  if (intent === 'move') {
    await moveFaq(id, form.get('dir') === 'up' ? 'up' : 'down');
    return data<ActionResult>({ ok: true, message: 'Urutan diperbarui' });
  }
  if (intent === 'delete') {
    await deleteFaq(id);
    return data<ActionResult>({ ok: true, message: 'FAQ dihapus' });
  }
  return data<ActionResult>({ ok: false, message: 'Aksi tidak dikenal' }, { status: 400 });
}

type Faq = Route.ComponentProps['loaderData']['faqs'][number];

export default function AdminFaq({ loaderData }: Route.ComponentProps) {
  const { faqs } = loaderData;
  const fetcher = useFetcher<ActionResult>();
  const [editing, setEditing] = useState<Faq | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);

  useActionToast(fetcher.data, () => setEditing(null));

  const submit = (values: Record<string, string>) => fetcher.submit(values, { method: 'post' });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pertanyaan yang sering diajukan calon klien. Urutan di sini sama dengan urutan di situs.</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus />
          Tambah pertanyaan
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Belum ada pertanyaan</EmptyTitle>
            <EmptyDescription>Tambahkan pertanyaan pertama agar tampil di situs.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Urutan</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead className="w-28">Tampil</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((f, i) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <OrderButtons index={i} total={faqs.length} onMove={(dir) => submit({ intent: 'move', id: f.id, dir })} />
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="font-medium">{f.question}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
                    </TableCell>
                    <TableCell>
                      <Switch aria-label={`Tampilkan ${f.question}`} checked={f.isPublished} onCheckedChange={(checked) => submit({ intent: 'toggle', id: f.id, isPublished: String(checked) })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${f.question}`} onClick={() => setEditing(f)}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${f.question}`} onClick={() => setDeleting(f)}>
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

      <FaqDialog key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')} faq={editing} onClose={() => setEditing(null)} fetcher={fetcher} />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus pertanyaan ini?"
        description={deleting?.question}
        onConfirm={() => {
          if (deleting) submit({ intent: 'delete', id: deleting.id });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function FaqDialog({ faq, onClose, fetcher }: { faq: Faq | 'new' | null; onClose: () => void; fetcher: ReturnType<typeof useFetcher<ActionResult>> }) {
  const current = faq && faq !== 'new' ? faq : null;
  const saving = fetcher.state !== 'idle';
  const errors = useFreshErrors(fetcher.data);
  const [published, setPublished] = useState(current?.isPublished ?? true);

  return (
    <Dialog open={faq !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{current ? 'Ubah pertanyaan' : 'Tambah pertanyaan'}</DialogTitle>
          <DialogDescription>Tulis jawaban singkat dan jelas. Baris baru ikut tampil.</DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" id="faq-form" className="-mx-1 min-h-0 overflow-y-auto px-1">
          <input type="hidden" name="intent" value="save" />
          <input type="hidden" name="id" value={current?.id ?? ''} />
          <FieldGroup>
            <Field data-invalid={errors.question ? true : undefined}>
              <FieldLabel htmlFor="question">Pertanyaan</FieldLabel>
              <Input id="question" name="question" defaultValue={current?.question} maxLength={200} autoFocus aria-invalid={errors.question ? true : undefined} />
              {errors.question ? <FieldError>{errors.question}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.answer ? true : undefined}>
              <FieldLabel htmlFor="answer">Jawaban</FieldLabel>
              <Textarea id="answer" name="answer" defaultValue={current?.answer} rows={6} maxLength={1500} aria-invalid={errors.answer ? true : undefined} />
              {errors.answer ? <FieldError>{errors.answer}</FieldError> : null}
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
          <Button type="submit" form="faq-form" disabled={saving}>
            {saving ? <Spinner /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
