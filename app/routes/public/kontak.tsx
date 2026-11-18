// app/routes/public/kontak.tsx
// Halaman Kontak. Data situs dimuat layout; loader hanya menyiapkan pilihan jenis acara,
// action menerima formulir (validasi, simpan, kirim email).
import { ContactSection } from "~/components/public/contact/contact-section";
import { useSite } from "~/components/public/layout/use-site";
import { PageHeader } from "~/components/public/shared/section";
import { publicHeaders } from "~/lib/public-headers";
import { contactSchema, type ContactResult } from "~/schemas/contact";
import { fieldErrors, firstErrors } from "~/schemas/common";
import { getContactOptions, submitContact } from "~/services/public/contact.server";
import type { Route } from "./+types/kontak";
import { breadcrumbLd, seoMeta } from "~/lib/seo";

export function loader() {
  return getContactOptions();
}

export async function action({ request }: Route.ActionArgs): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali isian Anda.",
      errors: firstErrors(fieldErrors(parsed.error)),
    };
  }

  try {
    const { confirmed } = await submitContact(parsed.data, new URL(request.url).origin);
    return {
      ok: true,
      message: "Pesan terkirim",
      name: parsed.data.name,
      eventType: parsed.data.eventType,
      confirmed,
    };
  } catch (error) {
    console.error("[kontak] gagal menyimpan pesan:", error);
    return {
      ok: false,
      message: "Pesan belum terkirim karena ada gangguan. Silakan coba lagi atau hubungi kami lewat WhatsApp.",
    };
  }
}

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  return seoMeta(matches, {
    title: "Hubungi kami",
    description:
      "Ceritakan rencana acara Anda. Kirim pesan, hubungi lewat WhatsApp, atau kunjungi kantor kami.",
    path: "/kontak",
    jsonLd: [breadcrumbLd(matches, [{ name: "Beranda", path: "/" }, { name: "Kontak", path: "/kontak" }])],
  });
}

export default function Kontak({ loaderData }: Route.ComponentProps) {
  const site = useSite();
  return (
    <>
      <PageHeader eyebrow="Kontak" title="Hubungi kami" description="Ceritakan rencana acara Anda, kami bantu dari sini." />
      {site ? <ContactSection site={site} eventTypes={loaderData.eventTypes} /> : null}
    </>
  );
}
