// app/routes/admin/api-media.tsx
import { MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, destroyAsset, getUploadedAsset, isValidPublicId } from '~/lib/cloudinary.server';
import { db } from '~/lib/db.server';
import { LANDSCAPE_ERROR, isLandscape } from '~/lib/image-rules';
import { mediaActionSchema } from '~/schemas/media';
import { deleteMedia, listMedia, mediaUsage } from '~/services/media.server';
import type { Route } from './+types/api-media';

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const take = Math.min(Math.max(Number(url.searchParams.get('take')) || 24, 1), 48);
  const result = await listMedia({
    take,
    cursor: url.searchParams.get('cursor'),
    q: url.searchParams.get('q')?.trim() || null,
    kind: url.searchParams.get('kind') === 'IMAGE' ? 'IMAGE' : null,
  });
  return json(result);
}

export async function action({ request }: Route.ActionArgs) {
  const body = await request.json().catch(() => null);
  const parsed = mediaActionSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Data tidak valid' }, 400);
  const input = parsed.data;

  if (input.intent === 'create') {
    if (!isValidPublicId(input.publicId)) {
      return json({ error: 'Lokasi file tidak valid' }, 400);
    }
    const select = {
      id: true,
      publicId: true,
      width: true,
      height: true,
      bytes: true,
      alt: true,
      kind: true,
      duration: true,
    } as const;

    const existing = await db.media.findUnique({ where: { publicId: input.publicId }, select });
    if (existing) return json({ media: existing });

    const kind = input.kind;
    const asset = await getUploadedAsset(input.publicId, kind);
    if (!asset) return json({ error: 'File tidak ditemukan di Cloudinary' }, 400);

    const reject = async (error: string) => {
      await destroyAsset(asset.publicId, kind).catch(() => {});
      return json({ error }, 400);
    };

    if (kind === 'VIDEO') {
      if (asset.bytes > MAX_VIDEO_BYTES) return reject('Ukuran video melebihi batas 15 MB');
      if ((asset.duration ?? 0) > MAX_VIDEO_SECONDS + 1) {
        return reject(`Durasi video melebihi batas ${MAX_VIDEO_SECONDS} detik`);
      }
    } else if (asset.bytes > MAX_UPLOAD_BYTES) {
      return reject('Ukuran gambar melebihi batas 12 MB');
    }

    if (input.orientation === 'landscape' && !isLandscape(asset.width, asset.height)) {
      return reject(LANDSCAPE_ERROR);
    }

    const media = await db.media.upsert({
      where: { publicId: asset.publicId },
      create: {
        publicId: asset.publicId,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        format: asset.format,
        kind,
        duration: asset.duration,
        alt: input.alt,
      },
      update: {},
      select,
    });
    return json({ media });
  }

  if (input.intent === 'alt') {
    const exists = await db.media.findUnique({ where: { id: input.id }, select: { id: true } });
    if (!exists) return json({ error: 'Gambar tidak ditemukan' }, 404);
    await db.media.update({ where: { id: input.id }, data: { alt: input.alt } });
    return json({ ok: true });
  }

  // delete
  const usage = await mediaUsage(input.id);
  if (usage === null) return json({ error: 'Gambar tidak ditemukan' }, 404);
  if (usage > 0) {
    return json({ error: `Gambar masih dipakai di ${usage} tempat` }, 409);
  }
  try {
    await deleteMedia(input.id);
  } catch (e) {
    console.error(e);
    return json({ error: 'Gagal menghapus gambar. Coba lagi.' }, 502);
  }
  return json({ ok: true });
}
