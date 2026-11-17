// app/services/article.server.ts
import { db } from '~/lib/db.server';
import { isLandscape } from '~/lib/image-rules';
import { readingMinutes } from '~/lib/reading-time';
import { sanitizeRichText } from '~/lib/sanitize.server';
import type { ArticleInput } from '~/schemas/article';
import { getMediaDims, mediaSelect } from './helpers.server';
import { deleteMediaIfUnused } from './media.server';

type Status = 'DRAFT' | 'PUBLISHED';

export function listArticles({ q, status, take }: { q?: string; status?: Status; take: number }) {
  return db.article.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [{ title: { contains: q, mode: 'insensitive' } }, { category: { contains: q, mode: 'insensitive' } }],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take,
    include: { cover: { select: mediaSelect } },
  });
}

export function getArticleBySlug(slug: string) {
  return db.article.findUnique({
    where: { slug },
    include: { cover: { select: mediaSelect } },
  });
}

/** Alamat admin memakai slug, jadi aksi mencari id dari slug lebih dulu. */
export async function findArticleId(slug: string) {
  const a = await db.article.findUnique({ where: { slug }, select: { id: true } });
  return a?.id ?? null;
}

/** Kategori yang sudah dipakai, untuk saran isian. */
export async function listCategories() {
  const rows = await db.article.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category);
}

export type SaveArticleResult = { ok: true; id: string; slug: string } | { ok: false; field?: string; message: string };

function isUniqueViolation(e: unknown) {
  return typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002';
}

export async function saveArticle(id: string | null, input: ArticleInput): Promise<SaveArticleResult> {
  const { contentHtml: rawHtml, publishedAt: chosenDate, ...fields } = input;
  const contentHtml = sanitizeRichText(rawHtml);

  if (fields.status === 'PUBLISHED' && !contentHtml) {
    return { ok: false, field: 'contentHtml', message: 'Isi artikel wajib diisi sebelum diterbitkan' };
  }

  const current = id ? await db.article.findUnique({ where: { id }, select: { coverId: true, publishedAt: true } }) : null;
  if (id && !current) return { ok: false, message: 'Artikel tidak ditemukan' };

  if (fields.coverId) {
    const m = await getMediaDims(fields.coverId);
    if (!m) return { ok: false, field: 'coverId', message: 'Gambar tidak ditemukan, pilih ulang' };
    if (m.kind !== 'IMAGE' || !isLandscape(m.width, m.height)) {
      return { ok: false, field: 'coverId', message: 'Gambar sampul harus landscape' };
    }
  }

  const clash = await db.article.findUnique({ where: { slug: fields.slug }, select: { id: true } });
  if (clash && clash.id !== id) {
    return { ok: false, field: 'slug', message: 'Slug sudah dipakai artikel lain' };
  }

  const publishedAt = fields.status === 'PUBLISHED' ? (chosenDate ?? current?.publishedAt ?? new Date()) : (current?.publishedAt ?? null);
  const data = { ...fields, contentHtml, readingMinutes: readingMinutes(contentHtml), publishedAt };

  let savedId = id;
  try {
    if (!id) {
      const created = await db.article.create({ data, select: { id: true } });
      savedId = created.id;
    } else {
      await db.article.update({ where: { id }, data });
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, field: 'slug', message: 'Slug sudah dipakai artikel lain' };
    throw e;
  }

  if (current?.coverId && current.coverId !== fields.coverId) {
    await deleteMediaIfUnused(current.coverId);
  }
  return { ok: true, id: savedId!, slug: fields.slug };
}

export async function setArticleStatus(id: string, status: Status): Promise<{ ok: true } | { ok: false; message: string }> {
  const a = await db.article.findUnique({
    where: { id },
    select: { contentHtml: true, publishedAt: true },
  });
  if (!a) return { ok: false, message: 'Artikel tidak ditemukan' };
  if (status === 'PUBLISHED' && !sanitizeRichText(a.contentHtml)) {
    return { ok: false, message: 'Isi artikel masih kosong, lengkapi dulu sebelum diterbitkan' };
  }
  await db.article.update({
    where: { id },
    data: { status, ...(status === 'PUBLISHED' && !a.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  return { ok: true };
}

export async function deleteArticle(id: string) {
  const current = await db.article.findUnique({ where: { id }, select: { coverId: true } });
  if (!current) return;
  await db.article.delete({ where: { id } });
  await deleteMediaIfUnused(current.coverId);
}
