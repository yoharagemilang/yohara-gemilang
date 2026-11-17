// app/components/cld-image.tsx
import { cldSrcSet, cldUrl, useCloudName } from '~/lib/cloudinary-url';

type Props = {
  /** kind VIDEO menampilkan gambar sampul dari frame pertama */
  media: {
    publicId: string;
    width: number;
    height: number;
    alt: string;
    kind?: 'IMAGE' | 'VIDEO';
  };
  /** Lebar yang dibuat Cloudinary untuk srcset */
  widths?: number[];
  sizes?: string;
  /** Rasio lebar/tinggi. Kosong = ikuti rasio asli. */
  aspect?: number;
  gravity?: 'auto' | 'face';
  priority?: boolean;
  className?: string;
  alt?: string;
};

export function CldImage({ media, widths = [320, 640, 960, 1280], sizes = '100vw', aspect, gravity, priority, className, alt }: Props) {
  const cloud = useCloudName();
  if (!cloud) return null;

  const mid = widths[Math.floor(widths.length / 2)]!;
  const width = aspect ? mid : media.width;
  const height = aspect ? Math.round(mid / aspect) : media.height;

  return (
    <img
      src={cldUrl(cloud, media.publicId, {
        w: mid,
        h: aspect ? height : undefined,
        crop: aspect ? 'fill' : 'limit',
        gravity,
        kind: media.kind,
      })}
      srcSet={cldSrcSet(cloud, media.publicId, widths, { aspect, gravity, kind: media.kind })}
      sizes={sizes}
      alt={alt ?? media.alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  );
}
