// app/components/public/faq/faq-list-section.tsx
// Isi halaman FAQ: seluruh pertanyaan terbit, atau pesan singkat bila belum ada.
import { Link } from "react-router";

import { cta } from "../shared/cta";
import { Reveal } from "../shared/reveal";
import { Container } from "../shared/section";
import { FaqAccordion } from "./faq-accordion";
import type { FaqView } from "~/services/public/faq.server";

export function FaqListSection({ faqs }: { faqs: FaqView[] }) {
  return (
    <Container className="py-14 md:py-20">
      {faqs.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-xl border border-line p-10 text-center">
          <p className="text-mute">Belum ada pertanyaan yang dipublikasikan. Silakan tanyakan langsung kepada kami.</p>
          <Link prefetch="viewport" to="/kontak" className={cta("red", "mt-6")}>
            Hubungi kami
          </Link>
        </div>
      ) : (
        <Reveal className="mx-auto max-w-3xl">
          <FaqAccordion items={faqs} />
        </Reveal>
      )}
    </Container>
  );
}
