"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameResult, SignalProfile } from "@/lib/types";
import { rankFromScore, syncPercentile } from "@/lib/frequency";

const TOTAL_BEATS = 16;
const BEAT_INTERVAL_MS = 700;

type LockOnGameProps = {
  profile: SignalProfile;
  onComplete: (result: GameResult) => void;
};

type BeatState = "waiting" | "active" | "done";

export function LockOnGame({ profile, onComplete }: LockOnGameProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [phase, setPhase] = useState<BeatState>("waiting");
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<"perfect" | "good" | "miss" | null>(
    null,
  );
  const stats = useRef({ perfect: 0, good: 0, miss: 0 });
  const activeAt = useRef(0);
  const finished = useRef(false);

  const windowMs = profile.beatWindowMs;

  const fireBeat = useCallback(() => {
    setPhase("active");
    activeAt.current = performance.now();
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
  }, []);

  useEffect(() => {
    if (beatIndex >= TOTAL_BEATS) {
      if (finished.current) return;
      finished.current = true;
      const total = stats.current;
      const points =
        total.perfect * 100 + total.good * 55 + total.miss * 0;
      const max = TOTAL_BEATS * 100;
      const score = Math.round((points / max) * 100);
      onComplete({
        score,
        ...total,
        rank: rankFromScore(score),
        syncPercent: syncPercentile(score, profile.signalId),
      });
      return;
    }

    setPhase("waiting");
    const t = setTimeout(fireBeat, BEAT_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [beatIndex, fireBeat, onComplete, profile.signalId]);

  const handleHit = useCallback(() => {
    if (phase !== "active" || beatIndex >= TOTAL_BEATS) return;

    const delta = Math.abs(performance.now() - activeAt.current);
    let result: "perfect" | "good" | "miss";
    if (delta <= windowMs) result = "perfect";
    else if (delta <= windowMs * 2.2) result = "good";
    else result = "miss";

    stats.current[result]++;
    setFeedback(result);
    setPhase("done");
    setTimeout(() => {
      setFeedback(null);
      setBeatIndex((b) => b + 1);
    }, 280);
  }, [phase, beatIndex, windowMs]);

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

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Lock on</span>
          <span>
            {beatIndex}/{TOTAL_BEATS}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: profile.colors.primary,
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleHit}
        className="relative flex h-48 w-48 items-center justify-center rounded-full border-2 transition-transform active:scale-95 sm:h-56 sm:w-56"
        style={{
          borderColor: profile.colors.primary,
          boxShadow: pulse
            ? `0 0 60px ${profile.colors.glow}, inset 0 0 40px ${profile.colors.primary}33`
            : `0 0 20px ${profile.colors.primary}44`,
          background: `radial-gradient(circle, ${profile.colors.primary}18 0%, transparent 70%)`,
        }}
        aria-label="Lock on to the beat"
      >
        <span
          className={`text-center text-sm font-medium uppercase tracking-widest transition-opacity ${
            phase === "active" ? "opacity-100" : "opacity-40"
          }`}
          style={{ color: profile.colors.primary }}
        >
          {phase === "active" ? "NOW" : "wait…"}
        </span>
        {feedback && (
          <span
            className="absolute -bottom-10 text-lg font-bold uppercase"
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
          </span>
        )}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {profile.signals.touch
          ? "Tap when the ring flares"
          : "Press Space or click when the ring flares"}
      </p>
    </div>
  );
}
