import type { CSSProperties } from "react";

type GlyphProps = {
  seed: number;
  color: string;
  size?: number;
};

export function Glyph({ seed, color, size = 120 }: GlyphProps) {
  const points = 6;
  const inner = size * 0.35;
  const outer = size * 0.48;
  const cx = size / 2;
  const cy = size / 2;

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
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_0_24px_var(--glyph-glow)]"
      style={{ "--glyph-glow": color } as CSSProperties}
      aria-hidden
    >
      <polygon
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx={cx} cy={cy} r={4} fill={color} opacity={0.9} />
    </svg>
  );
}
