"use client";

import { useEffect, useRef } from "react";

type AmbientCanvasProps = {
  hue?: number;
  intensity?: number;
};

export function AmbientCanvas({ hue = 270, intensity = 1 }: AmbientCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    let raf = 0;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      a: 0.1 + Math.random() * 0.4,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      c.fillStyle = "rgba(5, 5, 8, 0.25)";
      c.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 + p.x * 10);
        c.beginPath();
        c.arc(p.x * w, p.y * h, p.r * intensity, 0, Math.PI * 2);
        c.fillStyle = `hsla(${hue}, 80%, 65%, ${p.a * pulse * intensity})`;
        c.fill();
      }

      const g = c.createRadialGradient(
        w * 0.5,
        h * 0.3,
        0,
        w * 0.5,
        h * 0.3,
        w * 0.6,
      );
      g.addColorStop(0, `hsla(${hue}, 70%, 50%, ${0.06 * intensity})`);
      g.addColorStop(1, "transparent");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [hue, intensity]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}
