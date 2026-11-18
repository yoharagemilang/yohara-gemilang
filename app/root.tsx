// app/root.tsx
import { LazyMotion, MotionConfig } from "motion/react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import latinFont from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";

import type { Route } from "./+types/root";
import "./app.css";

export function loader() {
  // Nama cloud bersifat publik, dipakai untuk membuat URL gambar di browser
  return { cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "" };
}

export const links: Route.LinksFunction = () => [
  // Font di-host sendiri; subset latin dimuat lebih awal supaya teks tidak berkedip
  {
    rel: "preload",
    href: latinFont,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={() => import("~/lib/motion-features").then((mod) => mod.default)} strict>
        <Outlet />
      </LazyMotion>
    </MotionConfig>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let code = "Error";
  let title = "Terjadi kesalahan";
  let details = "Maaf, ada masalah yang tidak terduga. Silakan coba lagi.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      code = "404";
      title = "Halaman tidak ditemukan";
      details = "Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.";
    } else {
      code = String(error.status);
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-2xl content-center gap-4 px-5 py-16">
      <p className="text-sm font-semibold tracking-widest text-brand">{code}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-mute">{details}</p>
      <Link
        to="/"
        className="mt-4 inline-flex w-fit rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Kembali ke beranda
      </Link>
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-lg bg-soft p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
