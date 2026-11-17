// app/components/public/reveal.tsx
// Muncul halus saat masuk layar, sekali saja. Gerak (translate) otomatis dimatikan bagi pengguna
// yang memilih reduced-motion lewat MotionConfig di root. Tanpa JavaScript, root.tsx menampilkan
// isinya apa adanya lewat <noscript>.
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const tags = { div: motion.div, li: motion.li, article: motion.article, section: motion.section };

export function Reveal({ as = 'div', delay = 0, y = 24, className, children }: { as?: keyof typeof tags; delay?: number; y?: number; className?: string; children: ReactNode }) {
  const Comp = tags[as] as typeof motion.div;
  return (
    <Comp data-reveal className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -80px 0px' }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </Comp>
  );
}
