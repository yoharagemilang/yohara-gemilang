// app/lib/cloudinary.server.ts
import { v2 as cloudinary } from 'cloudinary';

import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS } from '~/lib/image-rules';

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // gambar
export { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS };
export const ALLOWED_FORMATS = 'webp,jpg,png,gif,svg';
export const ALLOWED_VIDEO_FORMATS = 'mp4,webm,mov';

export type AssetKind = 'IMAGE' | 'VIDEO';
const resourceType = (kind: AssetKind) => (kind === 'VIDEO' ? 'video' : 'image');

let configured = false;

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Konfigurasi Cloudinary belum lengkap (CLOUDINARY_*)');
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }
  return { cloudName, apiKey, apiSecret };
}

/** Semua unggahan masuk ke satu folder. Dipakai juga untuk memvalidasi publicId. */
export function uploadFolder() {
  const base = (process.env.CLOUDINARY_UPLOAD_FOLDER || 'yoharagemilang').replace(/^\/+|\/+$/g, '');
  return `${base}/media`;
}

/** Tanda tangan sekali pakai untuk unggah langsung dari browser. */
export function signUpload(kind: AssetKind = 'IMAGE') {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = uploadFolder();
  const allowedFormats = kind === 'VIDEO' ? ALLOWED_VIDEO_FORMATS : ALLOWED_FORMATS;
  const params = { folder, timestamp, allowed_formats: allowedFormats };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);
  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    allowedFormats,
    resourceType: resourceType(kind),
    signature,
  };
}

export function isValidPublicId(publicId: string) {
  return publicId.startsWith(`${uploadFolder()}/`) && /^[A-Za-z0-9_\-/]+$/.test(publicId) && !publicId.includes('//') && !publicId.includes('..');
}

export type UploadedAsset = {
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  duration: number | null;
};

/** Ambil data asli dari Cloudinary. Jangan percaya angka dari klien. */
export async function getUploadedAsset(publicId: string, kind: AssetKind = 'IMAGE'): Promise<UploadedAsset | null> {
  config();
  try {
    const r = await cloudinary.api.resource(publicId, { resource_type: resourceType(kind) });
    return {
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      format: r.format,
      duration: kind === 'VIDEO' ? Number(r.duration ?? 0) : null,
    };
  } catch (e: any) {
    if (e?.error?.http_code === 404 || e?.http_code === 404) return null;
    throw e;
  }
}

/** true kalau file sudah terhapus atau memang tidak ada. */
export async function destroyAsset(publicId: string, kind: AssetKind = 'IMAGE') {
  config();
  const r = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType(kind),
    invalidate: true,
  });
  return r.result === 'ok' || r.result === 'not found';
}
