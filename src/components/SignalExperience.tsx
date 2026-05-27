"use client";

import { useEffect, useState } from "react";
import { fetchGeo } from "@/lib/geo";
import {
  buildSignalProfile,
  getLocationLabel,
} from "@/lib/frequency";
import { collectSignals } from "@/lib/signals";
import type { GameResult, SignalProfile } from "@/lib/types";
import { Glyph } from "./Glyph";
import { LockOnGame } from "./LockOnGame";

type Phase = "intro" | "scan" | "reveal" | "game" | "result";

const SCAN_LINES = [
  "routing IP → city grid",
  "reading timezone & clock",
  "parsing browser & OS",
  "measuring screen & pixels",
  "checking connection speed",
  "sensing touch & motion prefs",
  "counting return visits",
  "generating your frequency",
];

export function SignalExperience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [profile, setProfile] = useState<SignalProfile | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (phase !== "scan") return;
    const lineTimer = setInterval(() => {
      setScanLine((l) => Math.min(l + 1, SCAN_LINES.length - 1));
    }, 400);
    const doneTimer = setTimeout(async () => {
      const geo = await fetchGeo();
      const signals = collectSignals();
      setProfile(buildSignalProfile(geo, signals));
      setPhase("reveal");
    }, 3200);
    return () => {
      clearInterval(lineTimer);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  function startScan() {
    setScanLine(0);
    setPhase("scan");
  }

  async function handleShare() {
    if (!profile || !result) return;
    const text = `I locked onto my signal on SIGNAL.
${profile.archetype.name} · ${profile.signalId}
Score: ${result.score}% — ${result.rank}
${getLocationLabel(profile.geo)}

Play: https://ashperry1.github.io/MillionDollarIdea/`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My SIGNAL",
          text,
          url: "https://ashperry1.github.io/MillionDollarIdea/",
        });
        return;
      }
    } catch {
      /* cancelled */
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-violet-400">
          Million Dollar Idea
        </p>
        <h1 className="mt-6 max-w-lg text-4xl font-bold tracking-tight sm:text-6xl">
          SIGNAL
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
          A website that reads you the moment you arrive — then turns you into
          a playable character. No signup. Sixty seconds. Yours only.
        </p>
        <button
          type="button"
          onClick={startScan}
          className="mt-10 rounded-full bg-violet-500 px-10 py-4 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          Scan my signal
        </button>
        <p className="mt-8 max-w-sm text-xs text-zinc-600">
          We use what your browser already shares: location (approx), time,
          device, language, screen, and connection. Nothing stored on a server.
        </p>
      </div>
    );
  }

  if (phase === "scan") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-ping rounded-full border border-violet-500/30" />
            <div className="absolute inset-4 animate-pulse rounded-full border border-violet-500/50" />
            <div className="absolute inset-8 rounded-full bg-violet-500/20" />
          </div>
          <p className="text-center font-mono text-sm text-violet-300">
            {SCAN_LINES[scanLine]}
          </p>
          <div className="space-y-2 font-mono text-xs text-zinc-600">
            {SCAN_LINES.slice(0, scanLine + 1).map((line) => (
              <p key={line} className="text-zinc-500">
                ✓ {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "reveal" && profile) {
    const loc = getLocationLabel(profile.geo);
    return (
      <div className="flex min-h-screen flex-col items-center px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <Glyph
            seed={profile.glyphSeed}
            color={profile.colors.primary}
            size={140}
          />
          <p className="mt-6 font-mono text-xs text-zinc-500">
            {profile.signalId}
          </p>
          <h2
            className="mt-4 text-3xl font-bold"
            style={{ color: profile.colors.primary }}
          >
            {profile.archetype.name}
          </h2>
          <p className="mt-2 text-xl text-zinc-200">
            {profile.archetype.title}
          </p>
          <p className="mt-2 text-zinc-500">{profile.archetype.tagline}</p>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left text-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Built from your visit
            </p>
            <ul className="mt-3 space-y-1.5 text-zinc-300">
              <li>
                <span className="text-zinc-500">Where · </span>
                {loc}, {profile.geo.country}
              </li>
              <li>
                <span className="text-zinc-500">When · </span>
                {profile.signals.localTime} · {profile.signals.dayOfWeek} ·{" "}
                {profile.signals.season}
              </li>
              <li>
                <span className="text-zinc-500">How · </span>
                {profile.signals.device} · {profile.signals.browser} on{" "}
                {profile.signals.os}
              </li>
              <li>
                <span className="text-zinc-500">Trait · </span>
                {profile.archetype.trait} · window {profile.beatWindowMs}ms
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setPhase("game")}
            className="mt-8 w-full rounded-full py-4 text-sm font-semibold text-zinc-950 sm:w-auto sm:px-12"
            style={{ background: profile.colors.primary }}
          >
            Play Lock On — prove your signal
          </button>
        </div>
      </div>
    );
  }

  if (phase === "game" && profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Lock On
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-100">
            Sync to your frequency
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {profile.archetype.name} · timing tuned to you
          </p>
        </div>
        <LockOnGame
          profile={profile}
          onComplete={(r) => {
            setResult(r);
            setPhase("result");
          }}
        />
      </div>
    );
  }

  if (phase === "result" && profile && result) {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <Glyph
            seed={profile.glyphSeed}
            color={profile.colors.accent}
            size={100}
          />
          <p className="mt-6 text-6xl font-bold tabular-nums" style={{ color: profile.colors.primary }}>
            {result.score}%
          </p>
          <p className="mt-2 text-xl font-medium text-zinc-200">
            {result.rank}
          </p>
          <p className="mt-2 text-zinc-500">
            More in sync than {result.syncPercent}% of signals from{" "}
            {profile.geo.country}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-zinc-900 p-3">
              <p className="text-2xl font-bold text-emerald-400">
                {result.perfect}
              </p>
              <p className="text-zinc-500">perfect</p>
            </div>
            <div className="rounded-xl bg-zinc-900 p-3">
              <p className="text-2xl font-bold text-amber-400">{result.good}</p>
              <p className="text-zinc-500">good</p>
            </div>
            <div className="rounded-xl bg-zinc-900 p-3">
              <p className="text-2xl font-bold text-red-400">{result.miss}</p>
              <p className="text-zinc-500">miss</p>
            </div>
          </div>

          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300">
              Everything we read from your visit
            </summary>
            <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-400">
              <li>signal_id: {profile.signalId}</li>
              <li>city: {profile.geo.city}</li>
              <li>country: {profile.geo.country} ({profile.geo.countryCode})</li>
              <li>coords: {profile.geo.latitude.toFixed(2)}, {profile.geo.longitude.toFixed(2)}</li>
              <li>timezone: {profile.signals.timezone}</li>
              <li>language: {profile.signals.language}</li>
              <li>languages: {profile.signals.languages.join(", ")}</li>
              <li>device: {profile.signals.device}</li>
              <li>os: {profile.signals.os}</li>
              <li>browser: {profile.signals.browser}</li>
              <li>screen: {profile.signals.screen} @ {profile.signals.pixelRatio}x</li>
              <li>touch: {String(profile.signals.touch)}</li>
              <li>cores: {profile.signals.cores}</li>
              <li>memory_gb: {profile.signals.memoryGB ?? "hidden"}</li>
              <li>connection: {profile.signals.connection}</li>
              <li>dark_mode: {String(profile.signals.prefersDark)}</li>
              <li>reduced_motion: {String(profile.signals.prefersReducedMotion)}</li>
              <li>cookies: {String(profile.signals.cookiesEnabled)}</li>
              <li>referrer: {profile.signals.referrer}</li>
              <li>visit_count: {profile.signals.visitCount}</li>
            </ul>
          </details>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full px-8 py-3.5 text-sm font-semibold text-zinc-950"
              style={{ background: profile.colors.primary }}
            >
              {copied ? "Copied!" : "Share my signal"}
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setPhase("intro");
              }}
              className="rounded-full border border-zinc-700 px-8 py-3.5 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Scan again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
