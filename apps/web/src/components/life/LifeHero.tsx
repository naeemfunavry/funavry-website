"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Handshake,
  Lightbulb,
  Sparkles,
  Sprout,
  Users,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

/* The three logo hues, "r,g,b". */
const AZURE = "68,158,216";
const AMBER = "245,159,19";
const STEEL = "143,169,184";

/** What the team is made of, set in orbit round the photograph. `x`/`y` are
    the chip's centre as a share of the orbit's box. */
const CHIPS: {
  label: string;
  icon: LucideIcon;
  tint: string;
  x: number;
  y: number;
}[] = [
  { label: "People", icon: Users, tint: AZURE, x: 50, y: 4 },
  { label: "Ideas", icon: Lightbulb, tint: AMBER, x: 90, y: 22 },
  { label: "Innovation", icon: Sparkles, tint: STEEL, x: 94, y: 68 },
  { label: "Impact", icon: BarChart3, tint: AMBER, x: 64, y: 95 },
  { label: "Growth", icon: Sprout, tint: AZURE, x: 18, y: 86 },
  { label: "Collaboration", icon: Handshake, tint: AMBER, x: 8, y: 38 },
];

/**
 * The Life @ Funavry opener: the site's navy stage, the copy on the left, and
 * on the right the team's photograph held in a globe of orbit rings with the
 * six things the team is made of floating round it.
 *
 * `id="top"` puts the nav in its on-dark style while it sits over this.
 */
export default function LifeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#102e54] pb-16 pt-[130px] lg:pb-20 lg:pt-[150px]"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(55%_75%_at_10%_30%,rgba(68,158,216,0.22),transparent_70%),radial-gradient(40%_60%_at_80%_55%,rgba(68,158,216,0.16),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />

      <Container wide className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          {/* ---- The copy ---- */}
          <div className="max-w-[600px]">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
                Life @ Funavry
              </span>
            </div>
            <h1 className="mt-5 text-h2 text-paper">
              <span className="block">
                <KineticWords text="People, ideas" trigger="mount" />
              </span>
              <span className="block">
                <KineticWords
                  text="and possibilities"
                  delay={0.12}
                  trigger="mount"
                />
              </span>
              <span className="block">
                <KineticWords
                  text="stronger together."
                  delay={0.24}
                  trigger="mount"
                  wordClassName={(_, i) =>
                    i === 0 ? "text-azure-300" : "text-amber"
                  }
                />
              </span>
            </h1>
            <Wipe delay={0.2}>
              <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.7] text-paper/70">
                At Funavry we are a team of curious minds, problem solvers and
                builders who believe in using technology to create real impact.
                We learn, collaborate and grow together — and enjoy the journey
                along the way.
              </p>
            </Wipe>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="#moments" variant="accent" size="md" arrow>
                See the moments
              </Button>
              <Button href="/contact" variant="outline" size="md">
                Join our team
              </Button>
            </div>
          </div>

          {/* ---- The orbit ---- */}
          <div className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[480px] lg:max-w-[540px]">
            {/* Rings: the globe's orbits, two of them turning slowly. */}
            <span
              aria-hidden
              className="absolute inset-[6%] rounded-full border border-paper/10"
            />
            <span
              aria-hidden
              className="hero-spin absolute inset-[12%] rounded-full border border-dashed border-azure/35"
              style={{ animationDuration: "90s" }}
            />
            <span
              aria-hidden
              className="hero-spin absolute inset-0 rounded-full border border-dashed border-paper/10"
              style={{
                animationDuration: "140s",
                animationDirection: "reverse",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-[18%] rounded-full shadow-[0_0_90px_10px_rgba(68,158,216,0.35)]"
            />

            {/* The photograph, as the globe. */}
            <div className="absolute inset-[20%] overflow-hidden rounded-full border-2 border-azure/50 bg-ink-900">
              <Image
                src="/about/5.webp"
                alt="The whole Funavry team on a lawn below green hills on a company outing"
                fill
                priority
                quality={85}
                sizes="(max-width: 640px) 220px, 330px"
                className="object-cover object-[center_45%]"
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,transparent_45%,rgba(16,46,84,0.55)_100%)]"
              />
            </div>

            {/* The chips. */}
            {CHIPS.map(({ label, icon: Icon, tint, x, y }, i) => (
              <motion.div
                key={label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.08,
                  ease: [0.19, 1, 0.22, 1],
                }}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={{
                    duration: 5 + (i % 3),
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col items-center gap-1.5 border rounded-lg border-line bg-paper-white px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] sm:gap-2 sm:px-4 sm:py-3"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center sm:h-9 sm:w-9"
                    style={{
                      background: `rgba(${tint},0.12)`,
                      color: tint === STEEL ? "rgb(55,96,121)" : `rgb(${tint})`,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium tracking-[-0.01em] text-ink sm:text-[12.5px]">
                    {label}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
