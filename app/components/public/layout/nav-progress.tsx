// app/components/public/layout/nav-progress.tsx
// Garis merah tipis di atas layar selama perpindahan halaman. Memberi tanda seketika setelah tap,
// jadi pengunjung di HP tidak mengira tap-nya gagal dan menekan dua kali.
import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

type Phase = "idle" | "loading" | "done";

const styles: Record<Phase, React.CSSProperties> = {
  idle: { transform: "scaleX(0)", opacity: 0, transition: "none" },
  loading: { transform: "scaleX(0.85)", opacity: 1, transition: "transform 8s cubic-bezier(0.1, 0.6, 0.2, 1)" },
  done: { transform: "scaleX(1)", opacity: 0, transition: "transform 200ms ease-out, opacity 300ms ease-out 150ms" },
};

export function NavProgress() {
  const busy = useNavigation().state !== "idle";
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (busy) {
      setPhase("loading");
      return;
    }
    setPhase((p) => (p === "loading" ? "done" : "idle"));
    const t = setTimeout(() => setPhase("idle"), 500);
    return () => clearTimeout(t);
  }, [busy]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-80 h-[3px]">
      <div className="h-full origin-left bg-brand" style={styles[phase]} />
    </div>
  );
}
