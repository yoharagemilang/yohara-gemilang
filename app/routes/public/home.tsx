// app/routes/public/home.tsx
export function meta() {
  return [{ title: 'Yohara Gemilang Management' }];
}

export default function Home() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-3xl content-center gap-3 px-5">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">Event Organizer</p>
      <h1 className="text-4xl font-semibold tracking-tight">Yohara Gemilang Management</h1>
    </main>
  );
}
