// app/lib/cloudinary-url.ts
// Dipakai di server dan browser. Hanya membuat URL, tidak butuh secret.
import { useRouteLoaderData } from 'react-router';

export type CldOptions = {
  w?: number;
  h?: number;
  /** fill = potong sesuai rasio, limit = perkecil tanpa memotong */
  crop?: 'fill' | 'limit' | 'fit';
  gravity?: 'auto' | 'face';
  quality?: 'auto' | number;
  /** VIDEO menghasilkan gambar sampul dari frame pertama video */
  kind?: 'IMAGE' | 'VIDEO';
};

export function cldUrl(cloudName: string, publicId: string, o: CldOptions = {}) {
  const video = o.kind === 'VIDEO';
  const t = video ? ['so_0', `q_${o.quality ?? 'auto'}`] : ['f_auto', `q_${o.quality ?? 'auto'}`];
  if (o.w) t.push(`w_${o.w}`);
  if (o.h) t.push(`h_${o.h}`);
  if (o.w || o.h) {
    const crop = o.crop ?? (o.h ? 'fill' : 'limit');
    t.push(`c_${crop}`);
    if (crop === 'fill' && o.gravity) t.push(`g_${o.gravity}`);
  }
  if (video) {
    return `https://res.cloudinary.com/${cloudName}/video/upload/${t.join(',')}/${publicId}.jpg`;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${t.join(',')}/${publicId}`;
}

/** Sumber video untuk <video>. webm dulu karena lebih kecil, mp4 sebagai cadangan. */
export function cldVideoSources(cloudName: string, publicId: string, width = 1280) {
  const base = `https://res.cloudinary.com/${cloudName}/video/upload`;
  return [
    { src: `${base}/c_limit,w_${width},q_auto,vc_vp9/${publicId}.webm`, type: 'video/webm' },
    { src: `${base}/c_limit,w_${width},q_auto,vc_h264/${publicId}.mp4`, type: 'video/mp4' },
  ];
}

/** srcset; kalau aspect (lebar / tinggi) diberi, gambar dipotong ke rasio itu. */
export function cldSrcSet(cloudName: string, publicId: string, widths: number[], o: { aspect?: number; gravity?: CldOptions['gravity']; kind?: CldOptions['kind'] } = {}) {
  return widths
    .map((w) => {
      const url = cldUrl(cloudName, publicId, {
        w,
        h: o.aspect ? Math.round(w / o.aspect) : undefined,
        crop: o.aspect ? 'fill' : 'limit',
        gravity: o.gravity,
        kind: o.kind,
      });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/** Nama cloud dikirim dari loader root (nilainya publik). */
export function useCloudName() {
  const root = useRouteLoaderData('root') as { cloudName?: string } | undefined;
  return root?.cloudName ?? '';
}
