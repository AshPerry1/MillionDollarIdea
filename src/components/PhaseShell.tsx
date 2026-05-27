"use client";

import type { ReactNode } from "react";
import { AmbientCanvas } from "./AmbientCanvas";

type PhaseShellProps = {
  children: ReactNode;
  hue?: number;
  soundOn: boolean;
  onToggleSound: () => void;
};

export function PhaseShell({
  children,
  hue = 270,
  soundOn,
  onToggleSound,
}: PhaseShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientCanvas hue={hue} />
      <div className="noise pointer-events-none fixed inset-0 -z-[5] opacity-[0.03]" aria-hidden />
      <button
        type="button"
        onClick={onToggleSound}
        className="fixed right-4 top-4 z-50 rounded-full border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur transition hover:border-zinc-500 hover:text-zinc-200"
        aria-label={soundOn ? "Mute sound" : "Enable sound"}
      >
        {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
      </button>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
