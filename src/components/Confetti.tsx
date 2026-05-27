"use client";

import { useEffect, useRef } from "react";

type ConfettiProps = {
  active: boolean;
  hue?: number;
};

export function Confetti({ active, hue = 270 }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 4 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      vy: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: `hsl(${(hue + i * 7) % 360}, 85%, 60%)`,
    }));

    let raf = 0;
    let frame = 0;
    const maxFrames = 180;

    const draw = () => {
      frame++;
      c.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      }
      if (frame < maxFrames) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, hue]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  );
}
