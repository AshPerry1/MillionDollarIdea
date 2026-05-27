export function LoadingReport() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="h-3 w-32 animate-pulse rounded-full bg-amber-500/30" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-800" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
        <div className="mt-8 grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-zinc-900"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-center text-sm text-zinc-500">
          Reading your million from where you stand…
        </p>
      </div>
    </div>
  );
}
