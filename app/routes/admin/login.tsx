// app/routes/admin/login.tsx
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Form, data, redirect, useNavigation } from "react-router";

import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

import { attemptLogin, adminHeaders, getAdminOrNull } from "~/middleware/auth.server";
import { clearLegacyAdminCookie, commitAdminSession } from "~/lib/session.server";
import { getClientIp, rateLimit } from "~/lib/rate-limit.server";
import { loginSchema, safeAdminPath } from "~/schemas/auth";
import type { Route } from "./+types/login";

export const middleware: Route.MiddlewareFunction[] = [adminHeaders];

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Masuk Admin | Yohara Gemilang" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  if (await getAdminOrNull(request)) throw redirect("/admin");
  const next = new URL(request.url).searchParams.get("next");
  return { next: safeAdminPath(next) };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const nextPath = safeAdminPath(form.get("next"));

  const limited = rateLimit(`login:${getClientIp(request)}`, {
    limit: 15,
    windowMs: 10 * 60_000,
  });
  if (!limited.ok) {
    return data(
      { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return data(
      { error: fields.email?.[0] ?? fields.password?.[0] ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const result = await attemptLogin(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    if (result.reason === "locked") {
      return data(
        { error: `Akun dikunci sementara. Coba lagi dalam ${result.retryAfterMin} menit.` },
        { status: 429 },
      );
    }
    return data({ error: "Email atau password salah." }, { status: 401 });
  }

  const headers = new Headers();
  headers.append("Set-Cookie", await commitAdminSession(result.admin));
  headers.append("Set-Cookie", clearLegacyAdminCookie());
  throw redirect(nextPath, { headers });
}

export default function AdminLogin({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const error = actionData?.error;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel merek: hanya tampil di layar lebar */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <img src="/logo-yg-light.png" alt="Yohara Gemilang Management" width={560} height={234} className="h-16 w-auto self-start" />

        <div className="relative z-10 max-w-md">
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">Panel admin</p>
          <h2 className="text-4xl leading-tight font-bold text-balance">
            Kelola situs dengan <span className="text-brand">rapi dan cepat.</span>
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/70">
            Perbarui beranda, layanan, portofolio, artikel, dan baca pesan yang masuk dari calon klien dalam satu tempat.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/50">© {new Date().getFullYear()} Yohara Gemilang Management</p>

        {/* Hiasan: lingkaran merah di sudut */}
        <div aria-hidden="true" className="absolute -right-24 -bottom-24 size-96 rounded-full bg-brand/90" />
        <div aria-hidden="true" className="absolute -right-8 -bottom-8 size-60 rounded-full border border-white/20" />
      </aside>

      {/* Formulir */}
      <section className="grid place-items-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <img
            src="/logo-yg.png"
            alt="Yohara Gemilang Management"
            width={560}
            height={234}
            className="mb-10 h-14 w-auto lg:hidden"
          />

          <h1 className="text-2xl font-bold tracking-tight">Masuk Admin</h1>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">Gunakan akun admin untuk mengelola situs.</p>

          <Form method="post">
            <input type="hidden" name="next" value={loaderData.next} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nama@yoharagemilang.com"
                  required
                  autoFocus
                  aria-invalid={error ? true : undefined}
                />
              </Field>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-11"
                    aria-invalid={error ? true : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
              <Button type="submit" disabled={busy} size="lg" className="w-full">
                {busy ? <Spinner /> : null}
                {busy ? "Memproses..." : "Masuk"}
              </Button>
            </FieldGroup>
          </Form>
        </div>
      </section>
    </main>
  );
}
