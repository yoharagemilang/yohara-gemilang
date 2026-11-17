// app/components/admin/rich-text-editor.tsx
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import { Toggle } from '~/components/ui/toggle';
import { richContentClass } from '~/lib/rich-content';
import { cn } from '~/lib/utils';

const LINK_OK = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
const LOOKS_LIKE_DOMAIN = /^[\w-]+(\.[\w-]+)+(\/|$)/;

/**
 * Editor teks kaya. Menaruh <input type="hidden" name={name}> berisi HTML, jadi bisa
 * dipakai langsung di dalam <Form>. HTML tetap dibersihkan lagi di server saat disimpan.
 */
export function RichTextEditor({
  name,
  label,
  description,
  value,
  error,
  id = name,
}: {
  name: string;
  label: string;
  description?: string;
  /** Isi awal (HTML). Perubahan nilai setelah tampil tidak dibaca lagi. */
  value: string;
  error?: string;
  id?: string;
}) {
  const [html, setHtml] = useState(value);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // SSR: editor baru dibuat di browser
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': `${id}-label`,
        class: cn(richContentClass, 'min-h-56 px-3 py-2.5 outline-none'),
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? '' : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            h2: editor.isActive('heading', { level: 2 }),
            h3: editor.isActive('heading', { level: 3 }),
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            bullet: editor.isActive('bulletList'),
            ordered: editor.isActive('orderedList'),
            quote: editor.isActive('blockquote'),
            link: editor.isActive('link'),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  });

  function openLink() {
    if (!editor) return;
    setLinkUrl((editor.getAttributes('link').href as string | undefined) ?? '');
    setLinkError(null);
    setLinkOpen(true);
  }

  function closeLink() {
    setLinkOpen(false);
    editor?.commands.focus();
  }

  function applyLink() {
    if (!editor) return;
    let href = linkUrl.trim();
    if (href === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!LINK_OK.test(href) && LOOKS_LIKE_DOMAIN.test(href)) href = `https://${href}`;
    if (!LINK_OK.test(href)) {
      setLinkError('Gunakan tautan seperti https://contoh.com, /kontak, mailto: atau tel:');
      return;
    }
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive('link')) {
      // Tidak ada teks terpilih: sisipkan alamatnya sebagai teks bertaut
      chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  }

  const s = state;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel id={`${id}-label`} onClick={() => editor?.commands.focus()}>
        {label}
      </FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}

      <input type="hidden" name={name} value={html} />

      {editor ? (
        <div className={cn('overflow-hidden rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50', error && 'border-destructive')}>
          <div
            className="flex flex-wrap items-center gap-1 border-b p-1"
            role="toolbar"
            aria-label="Format teks"
            // Cegah tombol mencuri fokus dari editor, supaya pilihan teks tidak hilang
            onMouseDown={(e) => e.preventDefault()}
          >
            <Toggle type="button" size="sm" aria-label="Judul besar" title="Judul besar" pressed={s?.h2 ?? false} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 />
            </Toggle>
            <Toggle type="button" size="sm" aria-label="Judul kecil" title="Judul kecil" pressed={s?.h3 ?? false} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 />
            </Toggle>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Toggle type="button" size="sm" aria-label="Tebal" title="Tebal" pressed={s?.bold ?? false} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
              <Bold />
            </Toggle>
            <Toggle type="button" size="sm" aria-label="Miring" title="Miring" pressed={s?.italic ?? false} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
              <Italic />
            </Toggle>
            <Toggle type="button" size="sm" aria-label="Garis bawah" title="Garis bawah" pressed={s?.underline ?? false} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
              <Underline />
            </Toggle>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Toggle type="button" size="sm" aria-label="Daftar poin" title="Daftar poin" pressed={s?.bullet ?? false} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
              <List />
            </Toggle>
            <Toggle type="button" size="sm" aria-label="Daftar nomor" title="Daftar nomor" pressed={s?.ordered ?? false} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered />
            </Toggle>
            <Toggle type="button" size="sm" aria-label="Kutipan" title="Kutipan" pressed={s?.quote ?? false} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote />
            </Toggle>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Toggle type="button" size="sm" aria-label="Tautan" title="Tautan" pressed={s?.link ?? false} onPressedChange={() => (linkOpen ? closeLink() : openLink())}>
              <Link2 />
            </Toggle>
            <div className="ml-auto flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Urungkan" title="Urungkan" disabled={!s?.canUndo} onClick={() => editor.chain().focus().undo().run()}>
                <Undo2 />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Ulangi" title="Ulangi" disabled={!s?.canRedo} onClick={() => editor.chain().focus().redo().run()}>
                <Redo2 />
              </Button>
            </div>
          </div>

          {linkOpen ? (
            <div className="space-y-1.5 border-b bg-muted/40 p-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError(null);
                  }}
                  onKeyDown={(e) => {
                    // Enter di sini tidak boleh mengirim form induk
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      closeLink();
                    }
                  }}
                  placeholder="https://contoh.com"
                  aria-label="Alamat tautan"
                  aria-invalid={linkError ? true : undefined}
                  className="min-w-48 flex-1"
                />
                <Button type="button" size="sm" onClick={applyLink}>
                  Terapkan
                </Button>
                {s?.link ? (
                  <Button type="button" variant="outline" size="sm" onClick={removeLink}>
                    Hapus tautan
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" size="sm" onClick={closeLink}>
                  Batal
                </Button>
              </div>
              {linkError ? <p className="text-sm text-destructive">{linkError}</p> : null}
            </div>
          ) : null}

          <EditorContent editor={editor} />
        </div>
      ) : (
        <Skeleton className="h-72 w-full rounded-lg" />
      )}

      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
