// app/components/public/layout/site-header.tsx
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import type { SiteInfo } from "~/services/site.server";
import { cta } from "../shared/cta";
import { publicNav } from "./nav";
import { Container } from "../shared/section";

export function SiteHeader({ site }: { site: SiteInfo }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu tertutup setelah berpindah halaman
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b bg-white/95 backdrop-blur-md transition-colors",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <Container className="flex h-18 items-center justify-between md:h-24">
        <Link prefetch="viewport" to="/" aria-label={`${site.companyName}, ke beranda`} className="flex items-center">
          <img
            src="/logo-yg.png"
            alt=""
            width={560}
            height={234}
            fetchPriority="high"
            className="h-12 w-auto md:h-16"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link prefetch="viewport" to="/kontak" className={cta("red", "hidden px-6 py-3 text-[0.88rem] md:inline-flex")}>
            Hubungi kami
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Buka menu"
              className="grid size-11.5 place-items-center rounded-lg border border-line transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent
              showCloseButton={false}
              className="fixed inset-y-0 right-0 z-60 flex h-full w-[min(400px,100%)] flex-col gap-0 border-0 bg-white px-7 pt-6 pb-8 shadow-xl transition duration-300 ease-out"
            >
              <div className="flex h-11.5 items-center justify-between">
                <SheetTitle className="text-xs font-semibold tracking-[0.14em] text-mute uppercase">Menu</SheetTitle>
                <SheetClose
                  aria-label="Tutup menu"
                  className="grid size-11.5 place-items-center rounded-lg border border-line transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                >
                  <X className="size-4" strokeWidth={1.6} />
                </SheetClose>
              </div>
              <SheetDescription className="sr-only">Navigasi situs {site.companyName}</SheetDescription>

              <nav aria-label="Menu utama" className="flex flex-1 flex-col overflow-y-auto pt-7">
                {publicNav.map((item) => (
                  <NavLink
                    prefetch="viewport"
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "border-b border-line py-4.5 text-[1.3rem] font-semibold tracking-[-0.01em] transition-colors hover:text-brand",
                        isActive && "text-brand",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="grid gap-1 pt-6 text-[0.9rem] text-mute">
                {site.phone ? <b className="font-semibold text-ink">{site.phone}</b> : null}
                {site.email ? <span>{site.email}</span> : null}
                <Link prefetch="viewport" to="/kontak" className={cta("red", "mt-4")}>
                  Konsultasi gratis
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
