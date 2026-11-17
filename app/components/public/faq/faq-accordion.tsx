// app/components/public/faq/faq-accordion.tsx
// Memakai <details name="..."> bawaan HTML: satu jawaban terbuka pada satu waktu, tanpa JavaScript,
// dan semua jawaban tetap ada di HTML sehingga terbaca mesin pencari.
export type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items, group = 'faq' }: { items: FaqItem[]; group?: string }) {
  return (
    <div className="border-t border-line">
      {items.map((item, i) => (
        <details key={item.id} name={group} open={i === 0} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-[1.04rem] font-semibold transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden className="relative size-6 shrink-0">
              <span className="absolute top-1/2 left-1/2 h-[1.5px] w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
              <span className="absolute top-1/2 left-1/2 h-[1.5px] w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-current transition-transform group-open:rotate-0 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="max-w-[62ch] pr-11 pb-6 text-[0.96rem] whitespace-pre-line text-mute">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
