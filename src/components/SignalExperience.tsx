"use client";

import { useEffect, useState } from "react";
import {
  playReveal,
  playScanTick,
  playVictory,
  resumeAudio,
} from "@/lib/audio";
import { fetchGeo } from "@/lib/geo";
import { buildSignalProfile, getLocationLabel } from "@/lib/frequency";
import { collectSignals } from "@/lib/signals";
import {
  loadStats,
  recordVisit,
  saveBestScore,
  type SavedStats,
} from "@/lib/storage";
import type { GameResult, SignalProfile } from "@/lib/types";
import { Confetti } from "./Confetti";
import { Glyph } from "./Glyph";
import { LockOnGame } from "./LockOnGame";
import { PhaseShell } from "./PhaseShell";

type Phase = "intro" | "scan" | "reveal" | "game" | "result";

const SCAN_LINES = [
  { label: "routing IP → city grid", key: "geo" },
  { label: "reading timezone & clock", key: "time" },
  { label: "parsing browser & OS", key: "ua" },
  { label: "measuring screen & pixels", key: "screen" },
  { label: "checking connection speed", key: "net" },
  { label: "sensing touch & motion prefs", key: "touch" },
  { label: "counting return visits", key: "visit" },
  { label: "generating your frequency", key: "freq" },
];

export function SignalExperience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [profile, setProfile] = useState<SignalProfile | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [scanData, setScanData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GameResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<SavedStats>({ bestScore: 0, streak: 0 });
  const [newBest, setNewBest] = useState(false);
  const [revealStep, setRevealStep] = useState(0);

  const hue = profile?.glyphSeed ?? 270;

  useEffect(() => {
    setStats(recordVisit());
  }, []);

  useEffect(() => {
    if (phase !== "scan") return;

    const geoPromise = fetchGeo();
    const signals = collectSignals();

    const lineTimer = setInterval(() => {
      setScanLine((l) => {
        const next = Math.min(l + 1, SCAN_LINES.length - 1);
        if (soundOn) playScanTick();
        return next;
      });
    }, 380);

    geoPromise.then((geo) => {
      setScanData({
        geo: `${geo.city}, ${geo.country}`,
        time: `${signals.localTime} · ${signals.timezone}`,
        ua: `${signals.browser} / ${signals.os}`,
        screen: signals.screen,
        net: signals.connection,
        touch: signals.touch ? "touch enabled" : "keyboard/mouse",
        visit: signals.isReturning
          ? `return #${signals.visitCount}`
          : "first contact",
        freq: "calibrating…",
      });
    });

    const doneTimer = setTimeout(async () => {
      const geo = await geoPromise;
      const p = buildSignalProfile(geo, signals);
      setProfile(p);
      if (soundOn) playReveal();
      setPhase("reveal");
      setRevealStep(0);
    }, 3400);

    return () => {
      clearInterval(lineTimer);
      clearTimeout(doneTimer);
    };
  }, [phase, soundOn]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const steps = 4;
    const t = setInterval(() => {
      setRevealStep((s) => Math.min(s + 1, steps));
    }, 350);
    return () => clearInterval(t);
  }, [phase]);

  function startScan() {
    resumeAudio();
    setScanLine(0);
    setScanData({});
    setPhase("scan");
  }

  async function handleShare() {
    if (!profile || !result) return;
    const text = `⚡ SIGNAL — I locked onto my frequency
${profile.archetype.name} · ${profile.signalId}
Score: ${result.score}% · ${result.rank}
Max combo: ×${result.maxCombo}
📍 ${getLocationLabel(profile.geo)}

Can you beat me?
https://ashperry1.github.io/MillionDollarIdea/`;

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

  function handleGameComplete(r: GameResult) {
    setResult(r);
    const best = saveBestScore(r.score);
    setNewBest(best);
    if (soundOn) playVictory();
    setStats(loadStats());
    setPhase("result");
  }

  if (phase === "intro") {
    return (
      <PhaseShell hue={270} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-violet-400/90">
              Million Dollar Idea
            </p>
            <h1 className="mt-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-6xl font-black tracking-tighter text-transparent sm:text-8xl">
              SIGNAL
            </h1>
            <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-zinc-400">
              The internet reads you the moment you arrive. We turn that into a
              character — then a game. Sixty seconds. Zero signup.
            </p>
          </div>

          {stats.streak > 1 && (
            <p className="mt-6 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
              🔥 {stats.streak}-day signal streak
            </p>
          )}
          {stats.bestScore > 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              Personal best: {stats.bestScore}%
            </p>
          )}

          <button
            type="button"
            onClick={startScan}
            className="group mt-12 relative overflow-hidden rounded-full bg-violet-500 px-12 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(139,92,246,0.4)] transition hover:scale-105 hover:bg-violet-400"
          >
            <span className="relative z-10">Scan my signal</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition group-hover:translate-x-full duration-700" />
          </button>

          <p className="mt-10 max-w-xs text-xs leading-relaxed text-zinc-600">
            Location, time, device, language, connection — only what your browser
            already shares. Nothing hits our servers.
          </p>
        </div>
      </PhaseShell>
    );
  }

  if (phase === "scan") {
    const current = SCAN_LINES[scanLine];
    return (
      <PhaseShell hue={hue} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="relative mx-auto mb-10 h-40 w-40">
              <div className="absolute inset-0 rounded-full border border-violet-500/20" />
              <div
                className="absolute inset-2 rounded-full border-2 border-violet-500/40"
                style={{ animation: "spin 3s linear infinite" }}
              />
              <div
                className="absolute inset-0 origin-bottom bg-gradient-to-t from-violet-500/30 to-transparent"
                style={{ animation: "radar 2s ease-in-out infinite" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_20px_#a78bfa]" />
              </div>
            </div>

            <p className="text-center font-mono text-sm text-violet-300">
              {current?.label}
            </p>

            <ul className="mt-8 space-y-2 font-mono text-xs">
              {SCAN_LINES.slice(0, scanLine + 1).map((line) => (
                <li
                  key={line.key}
                  className="flex justify-between gap-4 rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 animate-fade-up"
                >
                  <span className="text-emerald-500/80">✓</span>
                  <span className="flex-1 text-zinc-500">{line.label}</span>
                  <span className="truncate text-zinc-400">
                    {scanData[line.key] ?? "…"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PhaseShell>
    );
  }

  if (phase === "reveal" && profile) {
    const loc = getLocationLabel(profile.geo);
    return (
      <PhaseShell hue={hue} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)}>
        <div className="flex min-h-screen flex-col items-center px-6 py-16">
          <div
            className={`w-full max-w-lg text-center transition-all duration-700 ${revealStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Glyph
              seed={profile.glyphSeed}
              color={profile.colors.primary}
              size={160}
            />
          </div>

          <div
            className={`mt-8 w-full max-w-lg text-center transition-all duration-700 delay-100 ${revealStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-mono text-xs tracking-widest text-zinc-500">
              {profile.signalId}
            </p>
            <h2
              className="mt-4 text-4xl font-black tracking-tight sm:text-5xl"
              style={{ color: profile.colors.primary }}
            >
              {profile.archetype.name}
            </h2>
            <p className="mt-3 text-xl text-zinc-100">
              {profile.archetype.title}
            </p>
            <p className="mt-2 text-zinc-500">{profile.archetype.tagline}</p>
          </div>

          <div
            className={`mt-10 w-full max-w-lg transition-all duration-700 delay-200 ${revealStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: "Origin", v: `${loc}, ${profile.geo.country}` },
                {
                  k: "Arrival",
                  v: `${profile.signals.localTime} · ${profile.signals.dayOfWeek}`,
                },
                {
                  k: "Loadout",
                  v: `${profile.signals.device} · ${profile.signals.browser}`,
                },
                {
                  k: "Trait",
                  v: `${profile.archetype.trait} · ${profile.beatWindowMs}ms window`,
                },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    {item.k}
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">{item.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-10 transition-all duration-700 delay-300 ${revealStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <button
              type="button"
              onClick={() => setPhase("game")}
              className="rounded-full px-14 py-4 text-sm font-bold text-zinc-950 shadow-lg transition hover:scale-105"
              style={{
                background: profile.colors.primary,
                boxShadow: `0 0 40px ${profile.colors.glow}`,
              }}
            >
              Enter Lock On →
            </button>
          </div>
        </div>
      </PhaseShell>
    );
  }

  if (phase === "game" && profile) {
    return (
      <PhaseShell hue={hue} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Lock On
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Sync to your frequency
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: profile.colors.primary }}
            >
              {profile.archetype.name}
            </p>
          </div>
          <LockOnGame
            profile={profile}
            soundOn={soundOn}
            onComplete={handleGameComplete}
          />
        </div>
      </PhaseShell>
    );
  }

  if (phase === "result" && profile && result) {
    const showConfetti = result.score >= 70;
    return (
      <PhaseShell hue={hue} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)}>
        <Confetti active={showConfetti} hue={hue} />
        <div className="flex min-h-screen flex-col items-center px-6 py-16">
          <div className="w-full max-w-lg text-center">
            <Glyph
              seed={profile.glyphSeed}
              color={profile.colors.accent}
              size={110}
            />

            {newBest && (
              <p
                className="mt-4 animate-count-pop text-sm font-bold uppercase tracking-widest"
                style={{ color: profile.colors.accent }}
              >
                ★ New personal best ★
              </p>
            )}

            <p
              className="mt-6 text-7xl font-black tabular-nums tracking-tighter"
              style={{ color: profile.colors.primary }}
            >
              {result.score}%
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">
              {result.rank}
            </p>
            <p className="mt-3 text-zinc-500">
              More in sync than {result.syncPercent}% of signals from{" "}
              {profile.geo.country}
            </p>

            <div className="mt-8 grid grid-cols-4 gap-2 text-sm">
              {[
                { label: "perfect", val: result.perfect, color: "#34d399" },
                { label: "good", val: result.good, color: "#fbbf24" },
                { label: "miss", val: result.miss, color: "#f87171" },
                {
                  label: "combo",
                  val: `×${result.maxCombo}`,
                  color: profile.colors.accent,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 backdrop-blur"
                >
                  <p
                    className="text-xl font-bold tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.val}
                  </p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>

            {stats.bestScore > 0 && (
              <p className="mt-6 text-sm text-zinc-500">
                Best: {stats.bestScore}%
                {stats.streak > 1 && ` · ${stats.streak}-day streak`}
              </p>
            )}

            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300">
                Full signal fingerprint
              </summary>
              <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 font-mono text-[11px] text-zinc-500 backdrop-blur">
                {[
                  `id: ${profile.signalId}`,
                  `archetype: ${profile.archetype.name}`,
                  `city: ${profile.geo.city}`,
                  `country: ${profile.geo.country}`,
                  `coords: ${profile.geo.latitude.toFixed(2)}, ${profile.geo.longitude.toFixed(2)}`,
                  `tz: ${profile.signals.timezone}`,
                  `lang: ${profile.signals.language}`,
                  `device: ${profile.signals.device}`,
                  `os: ${profile.signals.os}`,
                  `browser: ${profile.signals.browser}`,
                  `screen: ${profile.signals.screen}`,
                  `connection: ${profile.signals.connection}`,
                  `referrer: ${profile.signals.referrer}`,
                  `visits: ${profile.signals.visitCount}`,
                ].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleShare}
                className="rounded-full px-10 py-4 text-sm font-bold text-zinc-950 transition hover:scale-105"
                style={{ background: profile.colors.primary }}
              >
                {copied ? "Copied!" : "Challenge a friend"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setNewBest(false);
                  setPhase("game");
                }}
                className="rounded-full border border-zinc-700 px-10 py-4 text-sm text-zinc-300 hover:border-zinc-500"
              >
                Play again
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setProfile(null);
                  setPhase("intro");
                }}
                className="rounded-full border border-zinc-800 px-10 py-4 text-sm text-zinc-500 hover:text-zinc-300"
              >
                New scan
              </button>
            </div>
          </div>
        </div>
      </PhaseShell>
    );
  }

  return null;
}
