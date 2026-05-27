"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playBeat,
  playGood,
  playMiss,
  playPerfect,
} from "@/lib/audio";
import { rankFromScore, syncPercentile } from "@/lib/frequency";
import type { GameResult, SignalProfile } from "@/lib/types";

const TOTAL_BEATS = 20;
const BASE_INTERVAL = 650;

type LockOnGameProps = {
  profile: SignalProfile;
  soundOn: boolean;
  onComplete: (result: GameResult) => void;
};

type BeatState = "countdown" | "waiting" | "active" | "done";

function haptic(ms: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

export function LockOnGame({ profile, soundOn, onComplete }: LockOnGameProps) {
  const [countdown, setCountdown] = useState(3);
  const [beatIndex, setBeatIndex] = useState(0);
  const [phase, setPhase] = useState<BeatState>("countdown");
  const [feedback, setFeedback] = useState<"perfect" | "good" | "miss" | null>(
    null,
  );
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const stats = useRef({ perfect: 0, good: 0, miss: 0 });
  const activeAt = useRef(0);
  const finished = useRef(false);
  const missTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<BeatState>("countdown");
  const maxComboRef = useRef(0);
  const hue = profile.glyphSeed % 360;
  const windowMs = profile.beatWindowMs;

  phaseRef.current = phase;

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("waiting");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  const registerHit = useCallback(
    (result: "perfect" | "good" | "miss", auto = false) => {
      if (!auto && phaseRef.current !== "active") return;
      if (missTimer.current) {
        clearTimeout(missTimer.current);
        missTimer.current = null;
      }

      stats.current[result]++;
      setFeedback(result);
      setPhase("done");
      phaseRef.current = "done";
      setFlash(result);

      if (result === "miss") {
        setCombo(0);
        if (soundOn) playMiss();
        haptic(80);
      } else if (result === "perfect") {
        setCombo((c) => {
          const next = c + 1;
          maxComboRef.current = Math.max(maxComboRef.current, next);
          return next;
        });
        if (soundOn) playPerfect();
        haptic(12);
      } else {
        setCombo((c) => {
          const next = c + 1;
          maxComboRef.current = Math.max(maxComboRef.current, next);
          return next;
        });
        if (soundOn) playGood();
        haptic(8);
      }

      setTimeout(() => {
        setFeedback(null);
        setFlash(null);
        setBeatIndex((b) => b + 1);
        setPhase("waiting");
        phaseRef.current = "waiting";
      }, 260);
    },
    [soundOn],
  );

  const fireBeat = useCallback(() => {
    setPhase("active");
    phaseRef.current = "active";
    activeAt.current = performance.now();
    if (soundOn) playBeat(hue);

    if (missTimer.current) clearTimeout(missTimer.current);
    missTimer.current = setTimeout(() => {
      registerHit("miss", true);
    }, windowMs * 3.5);
  }, [hue, soundOn, windowMs, registerHit]);

  const handleHit = useCallback(() => {
    if (phaseRef.current !== "active") return;
    const delta = Math.abs(performance.now() - activeAt.current);
    if (delta <= windowMs) registerHit("perfect");
    else if (delta <= windowMs * 2.2) registerHit("good");
    else registerHit("miss");
  }, [windowMs, registerHit]);

  useEffect(() => {
    if (phase !== "waiting" || beatIndex >= TOTAL_BEATS) return;
    const speedup = Math.floor(beatIndex / 5) * 40;
    const t = setTimeout(fireBeat, BASE_INTERVAL - speedup);
    return () => clearTimeout(t);
  }, [beatIndex, phase, fireBeat]);

  useEffect(() => {
    if (beatIndex < TOTAL_BEATS) return;
    if (finished.current) return;
    finished.current = true;
    const total = stats.current;
    const comboBonus = Math.min(15, maxComboRef.current * 2);
    const points = total.perfect * 100 + total.good * 55;
    const max = TOTAL_BEATS * 100;
    const score = Math.min(
      100,
      Math.round((points / max) * 100) + comboBonus,
    );
    onComplete({
      score,
      perfect: total.perfect,
      good: total.good,
      miss: total.miss,
      rank: rankFromScore(score),
      syncPercent: syncPercentile(score, profile.signalId),
      maxCombo: maxComboRef.current,
    });
  }, [beatIndex, onComplete, profile.signalId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleHit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleHit]);

  const progress = (beatIndex / TOTAL_BEATS) * 100;
  const ringScale = phase === "active" ? 1.12 : phase === "waiting" ? 0.94 : 1;

  if (phase === "countdown") {
    return (
      <div className="flex h-64 items-center justify-center">
        <span
          key={countdown}
          className="animate-count-pop text-8xl font-bold tabular-nums"
          style={{ color: profile.colors.primary }}
        >
          {countdown || "GO"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <div className="flex w-full items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Combo
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{
              color:
                combo > 4 ? profile.colors.accent : profile.colors.primary,
            }}
          >
            ×{combo}
          </p>
        </div>
        <p className="font-mono text-sm text-zinc-500">
          {beatIndex}/{TOTAL_BEATS}
        </p>
      </div>

      <div className="flex w-full gap-1">
        {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-200"
            style={{
              background:
                i < beatIndex
                  ? profile.colors.primary
                  : i === beatIndex && phase === "active"
                    ? profile.colors.accent
                    : "#27272a",
            }}
          />
        ))}
      </div>

      <div className="relative">
        {flash && (
          <div
            className="pointer-events-none absolute inset-0 rounded-full animate-flash"
            style={{
              background:
                flash === "perfect"
                  ? `${profile.colors.accent}55`
                  : flash === "good"
                    ? `${profile.colors.primary}40`
                    : "#ef444440",
            }}
          />
        )}
        <button
          type="button"
          onClick={handleHit}
          className="relative flex h-52 w-52 items-center justify-center rounded-full border-2 transition-transform duration-75 active:scale-95 sm:h-60 sm:w-60"
          style={{
            borderColor: profile.colors.primary,
            transform: `scale(${ringScale})`,
            boxShadow:
              phase === "active"
                ? `0 0 80px ${profile.colors.glow}, 0 0 120px ${profile.colors.primary}40`
                : `0 0 24px ${profile.colors.primary}22`,
            background: `radial-gradient(circle at 50% 40%, ${profile.colors.primary}30 0%, transparent 65%)`,
          }}
          aria-label="Lock on"
        >
          <div
            className="absolute inset-3 rounded-full border border-dashed opacity-40"
            style={{
              borderColor: profile.colors.primary,
              animation:
                phase === "active" ? "spin 0.5s linear infinite" : "none",
            }}
          />
          <span
            className="relative z-10 text-sm font-bold uppercase tracking-[0.3em]"
            style={{
              color: profile.colors.primary,
              opacity: phase === "active" ? 1 : 0.35,
            }}
          >
            {phase === "active" ? "LOCK" : "···"}
          </span>
        </button>
        {feedback && (
          <p
            className="absolute -bottom-12 left-1/2 w-max -translate-x-1/2 text-xl font-black uppercase tracking-wider animate-count-pop"
            style={{
              color:
                feedback === "miss"
                  ? "#f87171"
                  : feedback === "perfect"
                    ? profile.colors.accent
                    : profile.colors.primary,
            }}
          >
            {feedback}
          </p>
        )}
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: profile.colors.primary }}
        />
      </div>

      <p className="text-center text-xs text-zinc-500">
        {profile.signals.touch ? "Tap on LOCK" : "Space or click on LOCK"} ·
        beats accelerate
      </p>
    </div>
  );
}
