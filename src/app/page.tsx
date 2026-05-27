export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950"
        aria-hidden
      />
      <main className="relative z-10 flex max-w-2xl flex-col items-center gap-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Coming soon
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Million Dollar Idea
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-zinc-400">
          We&apos;re building something worth sharing. This is a placeholder
          while the full site takes shape.
        </p>
        <div className="mt-4 h-px w-24 bg-zinc-800" />
        <p className="text-sm text-zinc-500">
          Check back soon for updates.
        </p>
      </main>
    </div>
  );
}
