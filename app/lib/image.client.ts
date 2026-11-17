// app/lib/image.client.ts
// Hanya jalan di browser: validasi, ubah ke webp, unggah langsung ke Cloudinary.
import { LANDSCAPE_ERROR, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, isLandscape, type Orientation } from '~/lib/image-rules';
import type { MediaItem } from '~/schemas/media';

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
export const ACCEPT_VIDEO = 'video/mp4,video/webm,video/quicktime';
export const ACCEPT_MEDIA = `${ACCEPT},${ACCEPT_VIDEO}`;
const ACCEPTED_TYPES = ACCEPT.split(',');
const VIDEO_TYPES = ACCEPT_VIDEO.split(',');
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 2000;
const QUALITY = 0.85;

export class UploadError extends Error {}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new UploadError('Koneksi bermasalah. Periksa internet Anda.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new UploadError(data?.error ?? 'Permintaan gagal. Coba lagi.');
  }
  return data as T;
}

const post = (url: string, body?: unknown) =>
  api<any>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const mediaApi = {
  create: (publicId: string, alt = '', orientation: Orientation = 'any', kind: 'IMAGE' | 'VIDEO' = 'IMAGE') =>
    post('/admin/api/media', { intent: 'create', publicId, alt, orientation, kind }) as Promise<{
      media: MediaItem;
    }>,
  updateAlt: (id: string, alt: string) => post('/admin/api/media', { intent: 'alt', id, alt }) as Promise<{ ok: true }>,
  remove: (id: string) => post('/admin/api/media', { intent: 'delete', id }) as Promise<{ ok: true }>,
  list: (params: { cursor?: string | null; q?: string; take?: number; kind?: 'IMAGE' | 'VIDEO' }) => {
    const sp = new URLSearchParams();
    if (params.kind) sp.set('kind', params.kind);
    if (params.cursor) sp.set('cursor', params.cursor);
    if (params.q) sp.set('q', params.q);
    if (params.take) sp.set('take', String(params.take));
    return api<{
      items: (MediaItem & { usage: number })[];
      nextCursor: string | null;
    }>(`/admin/api/media?${sp}`);
  },
};

function validate(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new UploadError('Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau SVG.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new UploadError('Ukuran file melebihi 10 MB.');
  }
}

/** Baca ukuran lewat elemen img. Dipakai untuk SVG dan GIF yang tidak di-decode ke canvas. */
function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth > 0 && img.naturalHeight > 0 ? { width: img.naturalWidth, height: img.naturalHeight } : null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Ubah ke webp, maksimal 2000 px. SVG dan GIF dibiarkan apa adanya.
 * orientation "landscape" menolak gambar potret atau persegi sebelum diunggah.
 */
export async function prepareImage(file: File, orientation: Orientation = 'any'): Promise<File> {
  validate(file);

  const asIs = file.type === 'image/svg+xml' || file.type === 'image/gif' || (file.type === 'image/webp' && file.size < 300 * 1024);

  if (asIs) {
    if (orientation === 'landscape') {
      // SVG tanpa ukuran tidak terbaca di sini, nanti dicek ulang oleh server
      const dim = await readDimensions(file);
      if (dim && !isLandscape(dim.width, dim.height)) throw new UploadError(LANDSCAPE_ERROR);
    }
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new UploadError('File gambar rusak atau tidak bisa dibaca.');
  }

  try {
    if (orientation === 'landscape' && !isLandscape(bitmap.width, bitmap.height)) {
      throw new UploadError(LANDSCAPE_ERROR);
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));

    // Browser yang tidak bisa membuat webp mengembalikan png: pakai file asli.
    if (!blob || blob.type !== 'image/webp') return file;
    // Jangan pakai hasil yang lebih besar dari aslinya kalau tidak diperkecil.
    if (scale === 1 && blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') || 'gambar';
    return new File([blob], `${name}.webp`, { type: 'image/webp' });
  } finally {
    bitmap.close();
  }
}

type Signature = {
  resourceType: 'image' | 'video';
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  signature: string;
};

type VideoMeta = { duration: number; width: number; height: number };

/** Baca durasi dan ukuran video. null kalau browser tidak bisa membacanya (server tetap memeriksa). */
function readVideoMeta(file: File): Promise<VideoMeta | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    const done = (meta: VideoMeta | null) => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
      resolve(meta);
    };
    const timer = setTimeout(() => done(null), 8000);
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      done(Number.isFinite(video.duration) && video.videoWidth > 0 ? { duration: video.duration, width: video.videoWidth, height: video.videoHeight } : null);
    };
    video.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
    video.src = url;
  });
}

async function checkVideo(file: File, orientation: Orientation) {
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new UploadError('Format video tidak didukung. Gunakan MP4 atau WebM.');
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new UploadError(`Video terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 15 MB.`);
  }
  const meta = await readVideoMeta(file);
  if (!meta) return;
  if (meta.duration > MAX_VIDEO_SECONDS + 0.5) {
    throw new UploadError(`Video terlalu panjang (${Math.round(meta.duration)} detik). Maksimal ${MAX_VIDEO_SECONDS} detik.`);
  }
  if (orientation === 'landscape' && !isLandscape(meta.width, meta.height)) {
    throw new UploadError(LANDSCAPE_ERROR);
  }
}

function sendToCloudinary(file: File, s: Signature, onProgress?: (percent: number) => void): Promise<{ public_id: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.set('file', file);
    form.set('api_key', s.apiKey);
    form.set('timestamp', String(s.timestamp));
    form.set('folder', s.folder);
    form.set('allowed_formats', s.allowedFormats);
    form.set('signature', s.signature);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${s.cloudName}/${s.resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new UploadError('Unggahan gagal. Periksa koneksi Anda.'));
    xhr.onload = () => {
      let body: any = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body?.public_id) {
        resolve(body);
      } else {
        reject(new UploadError(body?.error?.message ?? 'Cloudinary menolak file ini.'));
      }
    };
    xhr.send(form);
  });
}

/** Alur lengkap: validasi, (gambar) ubah ke webp, tanda tangan, unggah, catat ke database. */
export async function uploadMedia(
  original: File,
  opts: {
    alt?: string;
    orientation?: Orientation;
    /** Izinkan video (hero). Bawaan: hanya gambar. */
    allowVideo?: boolean;
    onProgress?: (percent: number) => void;
  } = {},
): Promise<MediaItem> {
  const orientation = opts.orientation ?? 'any';
  const isVideo = original.type.startsWith('video/');

  if (isVideo && !opts.allowVideo) {
    throw new UploadError('Bagian ini hanya menerima gambar.');
  }

  let file = original;
  if (isVideo) await checkVideo(original, orientation);
  else file = await prepareImage(original, orientation);

  const kind = isVideo ? 'VIDEO' : 'IMAGE';
  const signature = await post('/admin/api/upload-sign', { kind });
  const uploaded = await sendToCloudinary(file, signature, opts.onProgress);
  const { media } = await mediaApi.create(uploaded.public_id, opts.alt ?? '', orientation, kind);
  return media;
}
