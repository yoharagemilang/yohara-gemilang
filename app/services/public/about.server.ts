// app/services/public/about.server.ts
import { db } from '~/lib/db.server';
import { getAbout } from '../about.server';
import { mediaSelect } from '../helpers.server';
import { pickMedia, type PublicMedia } from './media';

export type TeamMemberView = {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  photo: PublicMedia | null;
};

export async function getAboutData() {
  const [about, team] = await Promise.all([
    getAbout(),
    db.teamMember.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        position: true,
        bio: true,
        instagramUrl: true,
        linkedinUrl: true,
        photo: { select: mediaSelect },
      },
    }),
  ]);

  const founded: number | null = about?.foundedYear ?? null;
  return {
    about: {
      title: about?.title ?? 'Tentang kami',
      subtitle: about?.subtitle ?? '',
      contentHtml: about?.contentHtml ?? '',
      vision: about?.vision ?? '',
      mission: about?.mission ?? '',
      foundedYear: founded,
      yearsActive: founded ? Math.max(0, new Date().getFullYear() - founded) : null,
      cover: pickMedia(about?.cover),
    },
    team: team.map(
      (m: { id: string; name: string; position: string; bio: string | null; instagramUrl: string | null; linkedinUrl: string | null; photo: PublicMedia | null }): TeamMemberView => ({
        id: m.id,
        name: m.name,
        position: m.position,
        bio: m.bio,
        instagramUrl: m.instagramUrl,
        linkedinUrl: m.linkedinUrl,
        photo: pickMedia(m.photo),
      }),
    ),
  };
}

export type AboutData = Awaited<ReturnType<typeof getAboutData>>;
