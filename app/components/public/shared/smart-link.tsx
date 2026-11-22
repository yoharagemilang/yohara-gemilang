// app/components/public/shared/smart-link.tsx
// Tautan yang diisi dari admin bisa berupa alamat dalam situs ("/kontak"), jangkar lama ("#kontak"),
// atau alamat luar ("https://..."). Komponen ini memilih elemen yang tepat.
import type { ComponentProps } from "react";
import { Link } from "react-router";

export function resolveHref(href: string) {
  if (href.startsWith("#") && href.length > 1) return `/${href.slice(1)}`;
  return href;
}

export function SmartLink({ href, children, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const to = resolveHref(href);
  if (/^(https?:|mailto:|tel:)/i.test(to)) {
    return (
      <a href={to} target={to.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link prefetch="viewport" to={to} {...props}>
      {children}
    </Link>
  );
}
