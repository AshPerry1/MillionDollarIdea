"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type GlyphProps = {
  seed: number;
  color: string;
  size?: number;
  animate?: boolean;
};

export function Glyph({ seed, color, size = 120, animate = true }: GlyphProps) {
  const [rotation, setRotation] = useState(0);
  const points = 6;
  const inner = size * 0.35;
  const outer = size * 0.48;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      setRotation(((t - start) * 0.02 + seed * 0.01) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animate, seed]);

  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const wobble = ((seed >> (i % 8)) & 3) * 2;
    const x = cx + Math.cos(angle) * (r + wobble);
    const y = cy + Math.sin(angle) * (r + wobble);
    coords.push(`${x},${y}`);
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className="absolute rounded-full blur-3xl opacity-40"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: color,
        }}
        aria-hidden
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative drop-shadow-[0_0_32px_var(--glyph-glow)]"
        style={
          {
            "--glyph-glow": color,
            transform: `rotate(${rotation}deg)`,
            transition: animate ? "none" : undefined,
          } as CSSProperties
        }
        aria-hidden
      >
        <polygon
          points={coords.join(" ")}
          fill={`${color}22`}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * inner * 0.5;
          const y1 = cy + Math.sin(rad) * inner * 0.5;
          const x2 = cx + Math.cos(rad) * outer;
          const y2 = cy + Math.sin(rad) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}
      </svg>
    </div>
  );
}
