"use client";

import { useEffect, useRef } from "react";

/**
 * The signature backdrop: three arcs traced from the Funavry mark, with
 * signal particles running along them. The arcs are Build, Automate, Operate —
 * the logo *is* the delivery model, so the page opens on it in motion.
 *
 * Everything is drawn on one canvas at DPR. Particles carry the phase colour
 * of the arc they ride and fade as they reach the end, so the eye is pulled
 * left-to-right along the chain.
 */

type Arc = { p: number[][]; color: string; width: number };

/* Cubic beziers in a 0..1 box, echoing the mark's three nested swooshes. */
const ARCS: Arc[] = [
  { p: [[0.02, 0.30], [0.24, 0.02], [0.64, 0.02], [0.98, 0.13]], color: "68,158,216", width: 1.6 },
  { p: [[0.02, 0.60], [0.20, 0.33], [0.52, 0.31], [0.80, 0.40]], color: "245,159,19", width: 1.4 },
  { p: [[0.02, 0.90], [0.13, 0.69], [0.30, 0.64], [0.44, 0.70]], color: "55,96,121", width: 1.2 },
];

const PER_ARC = 26;

function bezier(p: number[][], t: number) {
  const u = 1 - t;
  const [a, b, c, d] = p;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return [
    a[0] * w0 + b[0] * w1 + c[0] * w2 + d[0] * w3,
    a[1] * w0 + b[1] * w1 + c[1] * w2 + d[1] * w3,
  ];
}

export default function ArcField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Particles, distributed along each arc with staggered phase and speed.
    const parts = ARCS.flatMap((arc, ai) =>
      Array.from({ length: PER_ARC }, (_, i) => ({
        ai,
        t: i / PER_ARC + Math.random() * 0.02,
        speed: 0.00055 + Math.random() * 0.0009,
        size: 0.7 + Math.random() * 1.7,
        arc,
      }))
    );

    // Reveal the strokes on first paint, then hold.
    let intro = 0;

    const drawArc = (arc: Arc, progress: number) => {
      ctx.beginPath();
      const steps = 90;
      const end = Math.max(1, Math.floor(steps * progress));
      for (let i = 0; i <= end; i++) {
        const [x, y] = bezier(arc.p, i / steps);
        if (i === 0) ctx.moveTo(x * w, y * h);
        else ctx.lineTo(x * w, y * h);
      }
      ctx.strokeStyle = `rgba(${arc.color},0.20)`;
      ctx.lineWidth = arc.width;
      ctx.stroke();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      intro = Math.min(1, intro + 0.012);
      const eased = 1 - Math.pow(1 - intro, 3);

      for (const arc of ARCS) drawArc(arc, eased);

      if (intro > 0.35) {
        for (const p of parts) {
          if (!reduce) p.t += p.speed;
          if (p.t > 1) p.t -= 1;

          const [nx, ny] = bezier(p.arc.p, p.t);
          const x = nx * w;
          const y = ny * h;

          // Fade in at the start of the arc, out at the end.
          const edge = Math.min(p.t / 0.12, (1 - p.t) / 0.18, 1);
          const alpha = Math.max(0, edge) * 0.9;

          // Comet head.
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.arc.color},${alpha})`;
          ctx.fill();

          // Short trail behind it.
          const [tx, ty] = bezier(p.arc.p, Math.max(0, p.t - 0.02));
          const g = ctx.createLinearGradient(tx * w, ty * h, x, y);
          g.addColorStop(0, `rgba(${p.arc.color},0)`);
          g.addColorStop(1, `rgba(${p.arc.color},${alpha * 0.5})`);
          ctx.beginPath();
          ctx.moveTo(tx * w, ty * h);
          ctx.lineTo(x, y);
          ctx.strokeStyle = g;
          ctx.lineWidth = p.size * 0.9;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
