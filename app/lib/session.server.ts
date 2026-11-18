// app/lib/session.server.ts
import { createCookieSessionStorage, type Session, type SessionStorage } from 'react-router';

type SessionData = {
  adminId: string;
  sessionVersion: number;
};

const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

let storage: SessionStorage<SessionData> | undefined;

function getStorage() {
  if (storage) return storage;

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET belum diisi atau kurang dari 32 karakter');
  }

  storage = createCookieSessionStorage<SessionData>({
    cookie: {
      name: '__yg_admin',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Harus "/" supaya ikut terkirim ke /admin.data (request data React Router).
      // Path "/admin" tidak cocok dengan "/admin.data" dan menyebabkan loop redirect.
      path: '/',
      maxAge: MAX_AGE,
      secrets: [secret],
    },
  });
  return storage;
}

export function getSession(request: Request): Promise<Session<SessionData>> {
  return getStorage().getSession(request.headers.get('Cookie'));
}

export async function commitAdminSession(admin: { id: string; sessionVersion: number }) {
  const session = await getStorage().getSession();
  session.set('adminId', admin.id);
  session.set('sessionVersion', admin.sessionVersion);
  return getStorage().commitSession(session);
}

export async function destroyAdminSession(request: Request) {
  const session = await getSession(request);
  return getStorage().destroySession(session);
}

/**
 * Versi awal memakai cookie dengan path "/admin". Cookie lama itu masih valid dan bisa
 * menahan sesi tetap aktif walau cookie baru (path "/") sudah dihapus. Header ini membersihkannya.
 */
export function clearLegacyAdminCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `__yg_admin=; Path=/admin; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`;
}
