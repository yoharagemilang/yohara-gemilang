// app/components/public/layout/whatsapp-button.tsx
import { waLink } from '~/lib/contact';
import { WhatsAppIcon } from '../shared/whatsapp-icon';

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;
  return (
    <aside aria-label="Hubungi lewat WhatsApp">
      <a
        href={waLink(whatsapp, 'Halo Yohara Gemilang Management, saya ingin konsultasi acara.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat lewat WhatsApp"
        className="fixed right-5 bottom-5 z-30 grid size-14 place-items-center rounded-full bg-[#128c7e] text-white shadow-[0_12px_28px_-10px_rgba(18,140,126,0.7)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#0b6f64] active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#128c7e] motion-reduce:transition-none"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </aside>
  );
}
