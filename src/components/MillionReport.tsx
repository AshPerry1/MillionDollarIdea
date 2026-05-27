"use client";

import { useEffect, useState } from "react";
import { fetchGeo } from "@/lib/geo";
import { buildMillionReport, formatNumber, getLocationLabel } from "@/lib/million";
import { getEconomics } from "@/lib/countryEconomics";
import { collectVisitorSignals } from "@/lib/visitor";
import type { MillionReport as Report } from "@/lib/types";
import { LoadingReport } from "./LoadingReport";
import { StatCard } from "./StatCard";

export function MillionReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const geo = await fetchGeo();
        const visitor = collectVisitorSignals();
        const data = buildMillionReport(geo, visitor);
        if (!cancelled) setReport(data);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleShare() {
    if (!report) return;
    const econ = getEconomics(report.geo.countryCode);
    const text = `My Real Million Report (${report.millionId})
📍 ${getLocationLabel(report.geo)}
⚡ Million Power: ${report.millionPower} (${report.nycComparison})
⏱ ${report.yearsToEarn} years to earn $1M in ${econ.name}
🏠 $1M = ${report.rentYears} years of rent here

See yours: https://ashperry1.github.io/MillionDollarIdea/`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Real Million Report",
          text,
          url: "https://ashperry1.github.io/MillionDollarIdea/",
        });
        return;
      }
    } catch {
      /* user cancelled share */
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-zinc-400">
          Couldn&apos;t load your report. Refresh to try again.
        </p>
      </div>
    );
  }

  if (!report) return <LoadingReport />;

  const econ = getEconomics(report.geo.countryCode);
  const location = getLocationLabel(report.geo);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.15),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
            Your Real Million
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {report.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            {report.subheadline}
          </p>
        </header>

        <section className="mb-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-zinc-900/80 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Your Million ID
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-amber-300">
                {report.millionId}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Detected from your visit
              </p>
              <p className="mt-1 text-lg font-medium">{location}</p>
              <p className="text-sm text-zinc-500">
                {report.geo.country} · {report.visitor.localTime} ·{" "}
                {report.visitor.dayOfWeek}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-zinc-500">
            What $1,000,000 means where you are
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              accent
              label="Million Power Index"
              value={`${report.millionPower}`}
              detail={report.nycComparison}
            />
            <StatCard
              label="Years to earn $1M"
              value={`${report.yearsToEarn} yrs`}
              detail={`At median income in ${econ.name} (~$${formatNumber(econ.medianAnnualIncomeUSD)}/yr)`}
            />
            <StatCard
              label="Rent covered"
              value={`${report.rentYears} yrs`}
              detail={`Average rent near you (~$${formatNumber(econ.avgRentMonthlyUSD)}/mo)`}
            />
            <StatCard
              label="Daily coffees"
              value={formatNumber(report.coffeeCups)}
              detail="Cups you could buy with $1M at $5.50 each"
            />
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-amber-400/90">
            Your visit fingerprint
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            We built this report from signals you already sent by opening this
            page — no account, no form.
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Location · </span>
              {location}, {report.geo.country}
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Timezone · </span>
              {report.visitor.timezone}
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Language · </span>
              {report.visitor.language}
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Device · </span>
              {report.visitor.device} ({report.visitor.screenBucket})
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Theme · </span>
              {report.visitor.prefersDark ? "dark mode" : "light mode"}
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300">
              <span className="text-zinc-500">Visit · </span>
              {report.visitor.isReturning
                ? `#${report.visitor.visitCount} (welcome back)`
                : "first time here"}
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300 sm:col-span-2">
              <span className="text-zinc-500">Arrival rarity · </span>
              Only ~{report.hourRarity}% of visitors browse at this hour
            </li>
            <li className="rounded-lg bg-zinc-950/60 px-3 py-2 text-zinc-300 sm:col-span-2">
              <span className="text-zinc-500">Came from · </span>
              {report.visitor.referrer}
            </li>
          </ul>
        </section>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleShare}
            className="w-full rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 sm:w-auto"
          >
            {copied ? "Copied to clipboard!" : "Share your million report"}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-full border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-50 sm:w-auto"
          >
            Refresh my report
          </button>
        </div>

        <footer className="mt-16 border-t border-zinc-800/80 pt-8 text-center">
          <p className="text-xs leading-relaxed text-zinc-600">
            The million-dollar idea: a million isn&apos;t a number — it&apos;s a
            place. Yours looks different from everyone else&apos;s. Estimates use
            public income and cost-of-living data by country. Not financial
            advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
