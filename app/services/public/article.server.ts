// app/services/public/article.server.ts
import { data } from 'react-router';

import { db } from '~/lib/db.server';
import { mediaSelect } from '../helpers.server';
import { pickMedia, type PublicMedia } from './media';

export const ARTICLE_PAGE_SIZE = 9;

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string | null;
  cover: PublicMedia | null;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: Date | null;
  cover: PublicMedia | null;
};

const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  publishedAt: true,
  cover: { select: mediaSelect },
} as const;

const newest = [{ publishedAt: 'desc' }, { createdAt: 'desc' }] as const;

function toItem(a: Row): ArticleListItem {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    cover: pickMedia(a.cover),
  };
}

export async function getArticleList({ category, page }: { category: string | null; page: number }) {
  const cats: { category: string }[] = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    distinct: ['category'],
    orderBy: { category: 'asc' },
    select: { category: true },
  });
  const categories = cats.map((c) => c.category);
  const active = category && categories.includes(category) ? category : null;
  const where = { status: 'PUBLISHED' as const, ...(active ? { category: active } : {}) };

  const total: number = await db.article.count({ where });
  const pages = Math.max(1, Math.ceil(total / ARTICLE_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  const rows: Row[] = await db.article.findMany({
    where,
    orderBy: [...newest],
    skip: (current - 1) * ARTICLE_PAGE_SIZE,
    take: ARTICLE_PAGE_SIZE,
    select: listSelect,
  });

  return { articles: rows.map(toItem), categories, active, page: current, pages, total };
}

export type ArticleDetail = ArticleListItem & { contentHtml: string; readingMinutes: number };

export async function getArticleDetail(slug: string) {
  const a = await db.article.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { ...listSelect, contentHtml: true, readingMinutes: true },
  });
  if (!a) throw data('Artikel tidak ditemukan', { status: 404 });

  // Terkait: kategori yang sama dulu, lalu dilengkapi artikel terbaru lainnya.
  const take = 3;
  const same: Row[] = await db.article.findMany({
    where: { status: 'PUBLISHED', category: a.category, id: { not: a.id } },
    orderBy: [...newest],
    take,
    select: listSelect,
  });
  const rest: Row[] =
    same.length < take
      ? await db.article.findMany({
          where: { status: 'PUBLISHED', id: { notIn: [a.id, ...same.map((s) => s.id)] } },
          orderBy: [...newest],
          take: take - same.length,
          select: listSelect,
        })
      : [];

  const article: ArticleDetail = { ...toItem(a), contentHtml: a.contentHtml, readingMinutes: a.readingMinutes };
  return { article, related: [...same, ...rest].map(toItem) };
}
