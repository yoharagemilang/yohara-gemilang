// app/routes/admin/login.tsx
import { Form, data, redirect, useNavigation } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';

import { attemptLogin, adminHeaders, getAdminOrNull } from '~/middleware/auth.server';
import { commitAdminSession } from '~/lib/session.server';
import { getClientIp, rateLimit } from '~/lib/rate-limit.server';
import { loginSchema, safeAdminPath } from '~/schemas/auth';
import type { Route } from './+types/login';

export const middleware: Route.MiddlewareFunction[] = [adminHeaders];

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Masuk Admin | Yohara Gemilang' }, { name: 'robots', content: 'noindex, nofollow' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  if (await getAdminOrNull(request)) throw redirect('/admin');
  const next = new URL(request.url).searchParams.get('next');
  return { next: safeAdminPath(next) };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const nextPath = safeAdminPath(form.get('next'));

  const limited = rateLimit(`login:${getClientIp(request)}`, {
    limit: 15,
    windowMs: 10 * 60_000,
  });
  if (!limited.ok) {
    return data({ error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } });
  }

  const parsed = loginSchema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return data({ error: fields.email?.[0] ?? fields.password?.[0] ?? 'Data tidak valid' }, { status: 400 });
  }

  const result = await attemptLogin(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    if (result.reason === 'locked') {
      return data({ error: `Akun dikunci sementara. Coba lagi dalam ${result.retryAfterMin} menit.` }, { status: 429 });
    }
    return data({ error: 'Email atau password salah.' }, { status: 401 });
  }

  throw redirect(nextPath, {
    headers: { 'Set-Cookie': await commitAdminSession(result.admin) },
  });
}

export default function AdminLogin({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const busy = navigation.state !== 'idle';
  const error = actionData?.error;

  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Yohara Gemilang</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Masuk Admin</CardTitle>
            <CardDescription>Gunakan akun admin untuk mengelola situs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <input type="hidden" name="next" value={loaderData.next} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" autoComplete="username" required autoFocus aria-invalid={error ? true : undefined} />
                </Field>
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={error ? true : undefined} />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? <Spinner /> : null}
                  {busy ? 'Memproses...' : 'Masuk'}
                </Button>
              </FieldGroup>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
