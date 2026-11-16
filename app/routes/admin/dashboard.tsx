// app/routes/admin/dashboard.tsx
import { Link } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '~/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { db } from '~/lib/db.server';
import { adminContext } from '~/middleware/auth.server';
import type { Route } from './+types/dashboard';

export async function loader({ context }: Route.LoaderArgs) {
  const admin = context.get(adminContext);

  const [services, partners, portfolioPublished, portfolioDraft, articlePublished, articleDraft, faqs, newMessages, latestMessages] = await Promise.all([
    db.service.count(),
    db.partner.count(),
    db.portfolioProject.count({ where: { status: 'PUBLISHED' } }),
    db.portfolioProject.count({ where: { status: 'DRAFT' } }),
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.article.count({ where: { status: 'DRAFT' } }),
    db.faq.count(),
    db.contactMessage.count({ where: { status: 'NEW' } }),
    db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, eventType: true, status: true, createdAt: true },
    }),
  ]);

  return {
    firstName: admin.name.split(' ')[0] ?? admin.name,
    stats: [
      { label: 'Layanan', value: services },
      { label: 'Partner', value: partners },
      { label: 'Portofolio terbit', value: portfolioPublished, note: `${portfolioDraft} draf` },
      { label: 'Artikel terbit', value: articlePublished, note: `${articleDraft} draf` },
      { label: 'FAQ', value: faqs },
      { label: 'Pesan baru', value: newMessages, highlight: newMessages > 0 },
    ] as { label: string; value: number; note?: string; highlight?: boolean }[],
    latestMessages: latestMessages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { firstName, stats, latestMessages } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Halo, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan isi situs saat ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className={`text-3xl ${s.highlight ? 'text-primary' : ''}`}>{s.value}</CardTitle>
              {s.note ? (
                <CardAction>
                  <Badge variant="secondary">{s.note}</Badge>
                </CardAction>
              ) : null}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesan terbaru</CardTitle>
          <CardAction>
            <Link to="/admin/pesan" className="text-sm font-medium text-primary">
              Lihat semua
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {latestMessages.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada pesan</EmptyTitle>
                <EmptyDescription>Pesan dari formulir kontak akan muncul di sini.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis acara</TableHead>
                  <TableHead className="text-right">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestMessages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.name} {m.status === 'NEW' ? <Badge className="ml-1">Baru</Badge> : null}
                    </TableCell>
                    <TableCell>{m.eventType}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{dateFmt.format(new Date(m.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
