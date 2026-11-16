// app/routes/public/home.tsx
import { smokeContext } from '~/lib/context';
import { db } from '~/lib/db.server';

import type { Route } from './+types/home';

export const middleware: Route.MiddlewareFunction[] = [
  async ({ context }, next) => {
    context.set(smokeContext, 'middleware-ok');
    const response = await next();
    response.headers.set('x-smoke-middleware', 'ok');
    return response;
  },
];

function describeError(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms))]);
}

export async function loader({ context }: Route.LoaderArgs) {
  const started = Date.now();
  let database: { ok: true; company: string; services: number; ms: number } | { ok: false; error: string };

  try {
    const [setting, services] = await withTimeout(
      Promise.all([
        db.siteSetting.findUnique({
          where: { id: 'main' },
          select: { companyName: true },
        }),
        db.service.count(),
      ]),
      8000,
    );
    database = {
      ok: true,
      company: setting?.companyName ?? '(kosong)',
      services,
      ms: Date.now() - started,
    };
  } catch (error) {
    database = { ok: false, error: describeError(error) };
  }

  return {
    middleware: context.get(smokeContext),
    node: process.version,
    region: process.env.VERCEL_REGION ?? 'local',
    renderedAt: new Date().toISOString(),
    database,
  };
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
  };
}

export function meta() {
  return [{ title: 'Smoke test | Yohara Gemilang' }];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { middleware, node, region, renderedAt, database } = loaderData;
  const rows: Array<[string, string, boolean]> = [
    ['SSR', `dirender ${renderedAt}`, true],
    ['Middleware', middleware, middleware === 'middleware-ok'],
    ['Node', node, true],
    ['Region', region, true],
    ['Database', database.ok ? `${database.company}, ${database.services} layanan, ${database.ms} ms` : database.error, database.ok],
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">Smoke test</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Yohara Gemilang Management</h1>
      <dl className="mt-8 divide-y divide-line border-y border-line">
        {rows.map(([label, value, ok]) => (
          <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-4">
            <dt className="text-sm text-mute">{label}</dt>
            <dd className={ok ? 'text-ink' : 'font-semibold text-brand'}>{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
