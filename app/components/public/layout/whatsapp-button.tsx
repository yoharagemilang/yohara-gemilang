// app/components/public/layout/whatsapp-button.tsx
import { MessageCircle } from 'lucide-react';

import { waLink } from '~/lib/contact';

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;
  return (
    <aside aria-label="Hubungi lewat WhatsApp">
      <a
        href={waLink(whatsapp, 'Halo Yohara Gemilang Management, saya ingin konsultasi acara.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat lewat WhatsApp"
        className="fixed right-5 bottom-5 z-30 grid size-13 place-items-center rounded-full bg-ink text-white shadow-lg transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
      >
        <MessageCircle className="size-6" strokeWidth={1.6} />
      </a>
    </aside>
  );
}
