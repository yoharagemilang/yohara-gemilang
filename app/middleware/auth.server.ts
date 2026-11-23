// app/middleware/auth.server.ts
import { verify, hash } from '@node-rs/argon2';
import { createContext, redirect, type MiddlewareFunction } from 'react-router';

import { db } from '~/lib/db.server';
import { getSession } from '~/lib/session.server';
import { runWithTiming, serverTiming, timingEnabled } from '~/lib/timing.server';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  sessionVersion: number;
};

/** Diisi oleh middleware requireAdmin, dibaca di loader/action lewat context.get */
export const adminContext = createContext<AdminUser>();

const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;

/** Header untuk semua halaman admin: tidak di-cache, tidak diindeks. */
export const adminHeaders: MiddlewareFunction<Response> = async (_, next) => {
  const t0 = performance.now();
  let response: Response;
  if (timingEnabled) {
    const { result, entries } = await runWithTiming(() => next());
    response = result;
    response.headers.set('Server-Timing', serverTiming(entries, performance.now() - t0));
  } else {
    response = await next();
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
};

const SESSION_TTL_MS = 15_000;
const sessionCache = new Map<string, { admin: AdminUser; expires: number }>();

/** Hapus hasil cek sesi yang tersimpan, dipanggil saat logout atau sessionVersion berubah. */
export function forgetAdminSession(id?: string) {
  if (id) sessionCache.delete(id);
  else sessionCache.clear();
}

async function loadAdmin(id: string): Promise<AdminUser | null> {
  const hit = sessionCache.get(id);
  if (hit && hit.expires > Date.now()) return hit.admin;
  const admin = await db.admin.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, sessionVersion: true },
  });
  if (admin) sessionCache.set(id, { admin, expires: Date.now() + SESSION_TTL_MS });
  else sessionCache.delete(id);
  return admin;
}

/** Wajib login. Sesi dicek ke database (disimpan 15 detik per server) supaya bisa dicabut lewat sessionVersion. */
export const requireAdmin: MiddlewareFunction<Response> = async ({ request, context }, next) => {
  const session = await getSession(request);
  const adminId = session.get('adminId');
  const version = session.get('sessionVersion');

  const admin = adminId ? await loadAdmin(adminId) : null;

  if (!admin || admin.sessionVersion !== version) {
    const url = new URL(request.url);
    const next = url.pathname + url.search;
    const target = request.method === 'GET' && next !== '/admin' ? `/admin/login?next=${encodeURIComponent(next)}` : '/admin/login';
    throw redirect(target);
  }

  context.set(adminContext, admin);
  return next();
};

/** Dipakai di halaman login: kalau sudah masuk, langsung ke dashboard. */
export async function getAdminOrNull(request: Request) {
  const session = await getSession(request);
  const adminId = session.get('adminId');
  if (!adminId) return null;
  const admin = await db.admin.findUnique({
    where: { id: adminId },
    select: { id: true, sessionVersion: true },
  });
  return admin && admin.sessionVersion === session.get('sessionVersion') ? admin : null;
}

// Hash palsu supaya waktu respons email salah = email benar.
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= hash('tidak-dipakai-untuk-apa-apa');
  return dummyHash;
}

export type LoginResult = { ok: true; admin: { id: string; sessionVersion: number } } | { ok: false; reason: 'invalid' } | { ok: false; reason: 'locked'; retryAfterMin: number };

export async function attemptLogin(email: string, password: string): Promise<LoginResult> {
  const admin = await db.admin.findUnique({ where: { email } });

  if (!admin) {
    await verify(await getDummyHash(), password).catch(() => false);
    return { ok: false, reason: 'invalid' };
  }

  const now = new Date();
  if (admin.lockedUntil && admin.lockedUntil > now) {
    const ms = admin.lockedUntil.getTime() - now.getTime();
    return { ok: false, reason: 'locked', retryAfterMin: Math.ceil(ms / 60000) };
  }

  const valid = await verify(admin.passwordHash, password).catch(() => false);

  if (!valid) {
    const updated = await db.admin.update({
      where: { id: admin.id },
      data: { failedLogins: { increment: 1 } },
      select: { failedLogins: true },
    });
    if (updated.failedLogins >= MAX_FAILED_LOGINS) {
      await db.admin.update({
        where: { id: admin.id },
        data: {
          failedLogins: 0,
          lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000),
        },
      });
    }
    return { ok: false, reason: 'invalid' };
  }

  if (admin.failedLogins > 0 || admin.lockedUntil) {
    await db.admin.update({
      where: { id: admin.id },
      data: { failedLogins: 0, lockedUntil: null },
    });
  }

  return {
    ok: true,
    admin: { id: admin.id, sessionVersion: admin.sessionVersion },
  };
}
