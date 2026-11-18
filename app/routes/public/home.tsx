// app/routes/public/home.tsx
// Beranda: hanya mengambil data dan menyusun komponen di components/public/home.
import { ArticlesSection } from "~/components/public/home/articles-section";
import { ContactSection } from "~/components/public/home/contact-section";
import { FaqSection } from "~/components/public/home/faq-section";
import { HeroSection } from "~/components/public/home/hero-section";
import { PartnersSection } from "~/components/public/home/partners-section";
import { PortfolioSection } from "~/components/public/home/portfolio-section";
import { ServicesSection } from "~/components/public/home/services-section";
import { publicHeaders } from "~/lib/public-headers";
import { getContactOptions } from "~/services/public/contact.server";
import { getHomeData } from "~/services/public/home.server";
import type { Route } from "./+types/home";
import { organizationLd, seoMeta } from "~/lib/seo";
import type { SiteInfo } from "~/services/site.server";

export async function loader() {
  const [home, contact] = await Promise.all([getHomeData(), getContactOptions()]);
  return { ...home, eventTypes: contact.eventTypes };
}

export const headers = publicHeaders;

export function meta({ matches }: Route.MetaArgs) {
  const site = matches.find((m) => m?.id === "routes/public/layout")?.loaderData as
    | { site?: SiteInfo }
    | undefined;
  const s = site?.site;
  return seoMeta(matches, {
    title: s?.seoTitle || `${s?.companyName ?? "Yohara Gemilang"} | Event Organizer`,
    rawTitle: true,
    description:
      s?.seoDescription ||
      "Event organizer untuk acara korporat, pernikahan, dan konser. Kami mengurus konsep, anggaran, vendor, dan pelaksanaan.",
    path: "/",
    jsonLd: [organizationLd(matches)].filter((x): x is object => x !== null),
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { hero, services, partners, projects, articles, faqs, eventTypes } = loaderData;
  return (
    <>
      <HeroSection hero={hero} />
      <ServicesSection services={services} />
      <PartnersSection partners={partners} />
      <PortfolioSection projects={projects} />
      <ArticlesSection articles={articles} />
      <FaqSection faqs={faqs} />
      <ContactSection eventTypes={eventTypes} />
    </>
  );
}
