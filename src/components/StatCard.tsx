type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
};

export function StatCard({ label, value, detail, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        accent
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-zinc-800 bg-zinc-900/60"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          accent ? "text-amber-300" : "text-zinc-50"
        }`}
      >
        {value}
      </p>
      {detail && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{detail}</p>
      )}
    </div>
  );
}
