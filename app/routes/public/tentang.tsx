// app/routes/public/tentang.tsx
// Halaman Tentang: hanya mengambil data dan menyusun komponen di components/public/about.
import { AboutCover } from '~/components/public/about/about-cover';
import { AboutStory } from '~/components/public/about/about-story';
import { TeamSection } from '~/components/public/about/team-section';
import { VisionMission } from '~/components/public/about/vision-mission';
import { CtaBanner } from '~/components/public/shared/cta-banner';
import { PageHeader } from '~/components/public/shared/section';
import { publicHeaders } from '~/lib/public-headers';
import { getAboutData } from '~/services/public/about.server';
import type { Route } from './+types/tentang';

export function loader() {
  return getAboutData();
}

export const headers = publicHeaders;

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.about.title ?? 'Tentang kami';
  return [{ title: `${title} | Yohara Gemilang Management` }];
}

export default function Tentang({ loaderData }: Route.ComponentProps) {
  const { about, team } = loaderData;
  return (
    <>
      <PageHeader eyebrow="Tentang kami" title={about.title} description={about.subtitle || undefined} />
      <AboutCover cover={about.cover} />
      <AboutStory about={about} />
      <VisionMission about={about} />
      <TeamSection team={team} />
      <CtaBanner />
    </>
  );
}
