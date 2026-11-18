// app/routes/public/home.tsx
// Beranda: hanya mengambil data dan menyusun komponen di components/public/home.
import { ArticlesSection } from '~/components/public/home/articles-section';
import { ContactSection } from '~/components/public/home/contact-section';
import { FaqSection } from '~/components/public/home/faq-section';
import { HeroSection } from '~/components/public/home/hero-section';
import { PartnersSection } from '~/components/public/home/partners-section';
import { PortfolioSection } from '~/components/public/home/portfolio-section';
import { ServicesSection } from '~/components/public/home/services-section';
import { publicHeaders } from '~/lib/public-headers';
import { getContactOptions } from '~/services/public/contact.server';
import { getHomeData } from '~/services/public/home.server';
import type { Route } from './+types/home';

export async function loader() {
  const [home, contact] = await Promise.all([getHomeData(), getContactOptions()]);
  return { ...home, eventTypes: contact.eventTypes };
}

export const headers = publicHeaders;

export function meta() {
  return [{ title: 'Yohara Gemilang Management' }];
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
