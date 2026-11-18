// app/services/public/portfolio.server.ts
import { data } from 'react-router';

import { db } from '~/lib/db.server';
import { mediaSelect } from '../helpers.server';
import { pickMedia, type PublicMedia } from './media';

export const PORTFOLIO_PAGE_SIZE = 9;

export type PortfolioListItem = {
  id: string;
  slug: string;
  title: string;
  city: string;
  year: number;
  guestCount: number | null;
  serviceTitle: string | null;
  cover: PublicMedia | null;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  city: string;
  year: number;
  guestCount: number | null;
  cover: PublicMedia | null;
  service: { title: string } | null;
};

const listSelect = {
  id: true,
  slug: true,
  title: true,
  city: true,
  year: true,
  guestCount: true,
  cover: { select: mediaSelect },
  service: { select: { title: true } },
} as const;

const newest = [{ publishedAt: 'desc' }, { createdAt: 'desc' }] as const;

function toItem(p: Row): PortfolioListItem {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    city: p.city,
    year: p.year,
    guestCount: p.guestCount,
    serviceTitle: p.service?.title ?? null,
    cover: pickMedia(p.cover),
  };
}

export async function getPortfolioList({ serviceId, page }: { serviceId: string | null; page: number }) {
  // Hanya layanan yang punya proyek terbit yang tampil sebagai filter.
  const filters: { id: string; title: string }[] = await db.service.findMany({
    where: { isPublished: true, projects: { some: { status: 'PUBLISHED' } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true },
  });
  const activeId = serviceId && filters.some((f) => f.id === serviceId) ? serviceId : null;
  const where = { status: 'PUBLISHED' as const, ...(activeId ? { serviceId: activeId } : {}) };

  const total: number = await db.portfolioProject.count({ where });
  const pages = Math.max(1, Math.ceil(total / PORTFOLIO_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  const rows: Row[] = await db.portfolioProject.findMany({
    where,
    orderBy: [...newest],
    skip: (current - 1) * PORTFOLIO_PAGE_SIZE,
    take: PORTFOLIO_PAGE_SIZE,
    select: listSelect,
  });

  return { projects: rows.map(toItem), filters, activeId, page: current, pages, total };
}

export type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  contentHtml: string;
  city: string;
  year: number;
  guestCount: number | null;
  serviceTitle: string | null;
  cover: PublicMedia | null;
  gallery: PublicMedia[];
};

export async function getProjectDetail(slug: string) {
  const p = await db.portfolioProject.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      contentHtml: true,
      city: true,
      year: true,
      guestCount: true,
      serviceId: true,
      cover: { select: mediaSelect },
      service: { select: { title: true } },
      images: { orderBy: { sortOrder: 'asc' }, select: { media: { select: mediaSelect } } },
    },
  });
  if (!p) throw data('Proyek tidak ditemukan', { status: 404 });

  // Terkait: layanan yang sama dulu, lalu dilengkapi proyek terbaru lainnya.
  const take = 3;
  const same: Row[] = p.serviceId
    ? await db.portfolioProject.findMany({
        where: { status: 'PUBLISHED', serviceId: p.serviceId, id: { not: p.id } },
        orderBy: [...newest],
        take,
        select: listSelect,
      })
    : [];
  const rest: Row[] =
    same.length < take
      ? await db.portfolioProject.findMany({
          where: { status: 'PUBLISHED', id: { notIn: [p.id, ...same.map((s) => s.id)] } },
          orderBy: [...newest],
          take: take - same.length,
          select: listSelect,
        })
      : [];

  const project: ProjectDetail = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    contentHtml: p.contentHtml,
    city: p.city,
    year: p.year,
    guestCount: p.guestCount,
    serviceTitle: p.service?.title ?? null,
    cover: pickMedia(p.cover),
    gallery: (p.images as { media: PublicMedia | null }[]).map((i) => pickMedia(i.media)).filter((m): m is PublicMedia => m !== null),
  };
  return { project, related: [...same, ...rest].map(toItem) };
}
