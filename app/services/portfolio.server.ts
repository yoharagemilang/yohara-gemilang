// app/services/portfolio.server.ts
import { db } from '~/lib/db.server';
import { isLandscape } from '~/lib/image-rules';
import { sanitizeRichText } from '~/lib/sanitize.server';
import type { PortfolioInput } from '~/schemas/portfolio';
import { mediaSelect } from './helpers.server';
import { deleteMediaIfUnused } from './media.server';

type Status = 'DRAFT' | 'PUBLISHED';

export function listProjects({ q, status, take }: { q?: string; status?: Status; take: number }) {
  return db.portfolioProject.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [{ title: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take,
    include: {
      cover: { select: mediaSelect },
      service: { select: { title: true } },
      _count: { select: { images: true } },
    },
  });
}

export function getProjectBySlug(slug: string) {
  return db.portfolioProject.findUnique({
    where: { slug },
    include: {
      cover: { select: mediaSelect },
      images: { orderBy: { sortOrder: 'asc' }, include: { media: { select: mediaSelect } } },
    },
  });
}

/** Alamat admin memakai slug, jadi aksi mencari id dari slug lebih dulu. */
export async function findProjectId(slug: string) {
  const p = await db.portfolioProject.findUnique({ where: { slug }, select: { id: true } });
  return p?.id ?? null;
}

export function listServiceOptions() {
  return db.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true },
  });
}

export type SaveProjectResult = { ok: true; id: string; slug: string } | { ok: false; field?: string; message: string };

function isUniqueViolation(e: unknown) {
  return typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002';
}

export async function saveProject(id: string | null, input: PortfolioInput): Promise<SaveProjectResult> {
  const { images, contentHtml: rawHtml, publishedAt: chosenDate, ...fields } = input;

  const current = id
    ? await db.portfolioProject.findUnique({
        where: { id },
        select: { coverId: true, publishedAt: true, images: { select: { mediaId: true } } },
      })
    : null;
  if (id && !current) return { ok: false, message: 'Proyek tidak ditemukan' };

  // Gambar: harus ada, berupa gambar (bukan video), dan landscape
  const mediaIds = [...new Set([fields.coverId, ...images].filter((m): m is string => !!m))];
  if (mediaIds.length > 0) {
    const found = await db.media.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, kind: true, width: true, height: true },
    });
    const byId = new Map(found.map((m) => [m.id, m]));
    const check = (mid: string, field: string): SaveProjectResult | null => {
      const m = byId.get(mid);
      if (!m) return { ok: false, field, message: 'Ada gambar yang tidak ditemukan, pilih ulang' };
      if (m.kind !== 'IMAGE' || !isLandscape(m.width, m.height)) {
        return { ok: false, field, message: 'Semua gambar harus landscape' };
      }
      return null;
    };
    if (fields.coverId) {
      const bad = check(fields.coverId, 'coverId');
      if (bad) return bad;
    }
    for (const mid of images) {
      const bad = check(mid, 'images');
      if (bad) return bad;
    }
  }

  if (fields.serviceId) {
    const service = await db.service.findUnique({ where: { id: fields.serviceId }, select: { id: true } });
    if (!service) return { ok: false, field: 'serviceId', message: 'Layanan tidak ditemukan' };
  }

  const clash = await db.portfolioProject.findUnique({ where: { slug: fields.slug }, select: { id: true } });
  if (clash && clash.id !== id) {
    return { ok: false, field: 'slug', message: 'Slug sudah dipakai proyek lain' };
  }

  const publishedAt = fields.status === 'PUBLISHED' ? (chosenDate ?? current?.publishedAt ?? new Date()) : (current?.publishedAt ?? null);
  const data = { ...fields, contentHtml: sanitizeRichText(rawHtml), publishedAt };
  const imageRows = images.map((mediaId, sortOrder) => ({ mediaId, sortOrder }));

  let savedId = id;
  try {
    if (!id) {
      const created = await db.portfolioProject.create({
        data: { ...data, images: { create: imageRows } },
        select: { id: true },
      });
      savedId = created.id;
    } else {
      await db.$transaction([db.portfolioImage.deleteMany({ where: { projectId: id } }), db.portfolioProject.update({ where: { id }, data: { ...data, images: { create: imageRows } } })]);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, field: 'slug', message: 'Slug sudah dipakai proyek lain' };
    throw e;
  }

  // Gambar yang dilepas dari proyek ini dihapus dari Cloudinary kalau tidak dipakai lagi
  if (current) {
    const before = [current.coverId, ...current.images.map((i) => i.mediaId)];
    const after = new Set(mediaIds);
    const removed = [...new Set(before)].filter((m): m is string => !!m && !after.has(m));
    await Promise.all(removed.map((m) => deleteMediaIfUnused(m)));
  }

  return { ok: true, id: savedId!, slug: fields.slug };
}

export function setProjectStatus(id: string, status: Status) {
  return db.portfolioProject.findUnique({ where: { id }, select: { publishedAt: true } }).then((p) =>
    db.portfolioProject.update({
      where: { id },
      data: {
        status,
        ...(status === 'PUBLISHED' && !p?.publishedAt ? { publishedAt: new Date() } : {}),
      },
    }),
  );
}

export function setProjectFeatured(id: string, isFeatured: boolean) {
  return db.portfolioProject.update({ where: { id }, data: { isFeatured } });
}

export async function deleteProject(id: string) {
  const current = await db.portfolioProject.findUnique({
    where: { id },
    select: { coverId: true, images: { select: { mediaId: true } } },
  });
  if (!current) return;
  await db.portfolioProject.delete({ where: { id } }); // baris gambar ikut terhapus (Cascade)
  const ids = [...new Set([current.coverId, ...current.images.map((i) => i.mediaId)])].filter((m): m is string => !!m);
  await Promise.all(ids.map((m) => deleteMediaIfUnused(m)));
}
