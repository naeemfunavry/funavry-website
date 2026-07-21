"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
// import AIEcosystem from "@/components/ui/AIEcosystem";
import ScrollCue from "@/components/ui/ScrollCue";
import { cn } from "@/lib/utils";

/* Ambient 3D orbit that stands in for the ecosystem visual — concentric rings
   on a tilted plane, each spinning at its own pace, in the phase colours. Kept
   faint so it reads as depth behind the copy, not a diagram. */
const RINGS = [
  {
    size: 280,
    dur: 24,
    ring: "border-azure/45",
    dot: "bg-azure shadow-[0_0_16px_4px_rgba(68,158,216,0.75)]",
  },
  {
    size: 440,
    dur: 40,
    ring: "border-steel-300/35",
    dot: "bg-steel-300 shadow-[0_0_12px_3px_rgba(143,202,235,0.5)]",
  },
  {
    size: 620,
    dur: 58,
    ring: "border-amber/30",
    dot: "bg-amber shadow-[0_0_14px_3px_rgba(245,159,19,0.6)]",
  },
  { size: 800, dur: 74, ring: "border-paper/15", dot: null },
  { size: 980, dur: 92, ring: "border-paper/[0.08]", dot: null },
];

/* The three verbs still carry the phase colours — they now sit under the
   headline as the company's operating model rather than as the headline.
   These are the on-dark tints: `amber-ink` and `steel` are both too dark to
   read against the ink stage. */
const VERBS = [
  { text: "Build", className: "text-azure" },
  { text: "Automate", className: "text-amber" },
  { text: "Operate", className: "text-steel-300" },
];

export default function Hero() {
  const HEADLINE = ["Building the", "Intelligent Enterprise"];

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink-900 pb-20 pt-[130px]"
    >
      {/* Aurora: three washes in the phase colours, drifting on different
          periods. Blurred far past their own edges, so what reads is the
          light, not the shape. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[15%] -top-[20%] h-[75vh] w-[75vw] animate-aurora-a rounded-full bg-azure/25 blur-[130px]" />
        <div className="absolute -right-[12%] top-[4%] h-[58vh] w-[58vw] animate-aurora-b rounded-full bg-amber/[0.13] blur-[140px]" />
        <div className="absolute -bottom-[25%] left-[22%] h-[65vh] w-[65vw] animate-aurora-c rounded-full bg-steel/35 blur-[130px]" />
      </div>

      {/* Grid over the wash, grain over both. */}
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />
      <div
        aria-hidden
        className="absolute inset-0 grain opacity-[0.16] mix-blend-overlay"
      />

      {/* Vignette — pulls the corners back down so the type keeps its contrast
          wherever a wash happens to drift. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(125%_105%_at_50%_38%,transparent_30%,rgba(20,24,26,0.72)_100%)]"
      />

      {/* Ambient 3D orbit — fills the right space the copy leaves open. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-[-10%] hidden w-[64%] items-center justify-center [perspective:1600px] lg:flex"
      >
        {/* A luminous focal glow so the right side reads as full, not empty. */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure/[0.14] blur-[120px]" />
        <div
          className="relative [transform-style:preserve-3d]"
          style={{ transform: "rotateX(64deg)" }}
        >
          {RINGS.map((r) => (
            <div
              key={r.size}
              className={cn(
                "hero-spin absolute left-1/2 top-1/2 rounded-full border",
                r.ring,
              )}
              style={{
                width: r.size,
                height: r.size,
                marginLeft: -r.size / 2,
                marginTop: -r.size / 2,
                animationDuration: `${r.dur}s`,
              }}
            >
              {r.dot && (
                <span
                  className={cn(
                    "absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    r.dot,
                  )}
                />
              )}
            </div>
          ))}
          {/* The core. */}
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure shadow-[0_0_32px_10px_rgba(68,158,216,0.6)]" />
        </div>
      </div>

      <Container wide className="relative z-10">
        {/* Copy, left-aligned. The ecosystem visual is retired in favour of the
            ambient 3D orbit in the background above. */}
        <div className="max-w-[860px]">
          <div>
            {/* The single hairline above the headline. */}
            <div
              className="hero-fade flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60 lg:text-[11px]"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="relative flex h-1.5 w-1.5 flex-none">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-azure" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-azure" />
              </span>
              <span>AI-First Engineering &amp; Global Business Services</span>
              <span
                aria-hidden
                className="hidden h-px flex-1 bg-paper/15 sm:block"
              />
            </div>

            {/* The headline. Each line is its own clipping slot, so no width cap
            here — a `ch` cap would resolve against the parent's 16px font,
            not the display size, and shear the letters off. */}
            <h1 className="mt-8 lg:mt-10">
              <span className="sr-only">
                Building the Intelligent Enterprise
              </span>
              {HEADLINE.map((line, i) => (
                <span
                  key={line}
                  aria-hidden
                  className="-mb-[0.3em] block overflow-hidden pb-[0.7em]"
                >
                  {/* Entrance is pure CSS (`.hero-rise`), not Framer Motion: a
                      JS animation can't start until React hydrates, and on a
                      throttled mobile CPU that's ~3s in. The headline is the
                      largest element on the page, so once it lands it sets LCP
                      — CSS lets it start rising at first paint and the timing
                      is kept short so it lands inside the LCP budget.
                      `prefers-reduced-motion` lands it still, no delay flash. */}
                  <span
                    className="hero-rise block text-h1 text-paper"
                    style={{ animationDelay: `${0.1 + i * 0.09}s` }}
                  >
                    {i === 1 ? (
                      <span className="text-sweep-dark">{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                </span>
              ))}
            </h1>

            {/* Measured LCP element. Kept on a short, early CSS fade so it's
                painted well inside the LCP budget — a Framer Motion fade held
                it at opacity 0 until hydration, which put LCP at ~3.8s. */}
            <p
              className="hero-fade mt-8 max-w-[50ch] text-[19px] leading-[1.6] text-paper/65 lg:text-[22px]"
              style={{ animationDelay: "0.24s" }}
            >
              Where AI, engineering, and business transformation converge.
            </p>

            <div
              className="hero-fade mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.34s" }}
            >
              {/* <MagneticButton href="#contact" variant="accent" arrow size="lg">
                Tell Us Your Idea
              </MagneticButton> */}
              <Button variant="accent" size="lg" href="#contact" arrow>
                Tell Us Your Idea
              </Button>
              <Button variant="outline" size="lg" href="#work" arrow>
                Explore Our Case Studies
              </Button>
            </div>
          </div>

          {/* The ecosystem visual is commented out; the ambient 3D orbit in the
              section background stands in for it.
          <motion.div
            aria-hidden
            className="hidden lg:block"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reduce ? 0.3 : 1.6,
              ease: [0.19, 1, 0.22, 1],
              delay: reduce ? 0 : 0.6,
            }}
          >
            <AIEcosystem />
          </motion.div>
          */}
        </div>

        {/* The operating model, stated once, as a footing rule. */}
        <div
          className="hero-fade mt-16 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-paper/15 pt-6 lg:mt-24"
          style={{ animationDelay: "0.44s" }}
        >
          {VERBS.map((verb, i) => (
            <span key={verb.text} className="flex items-center gap-5">
              <span
                className={`font-mono text-[11px] font-medium uppercase tracking-[0.22em] ${verb.className}`}
              >
                {verb.text}
              </span>
              {i < VERBS.length - 1 && (
                <span aria-hidden className="h-3 w-px bg-paper/20" />
              )}
            </span>
          ))}
          {/* The cue carries its own rule, so the row's spacer is gone: the
              wire the pulse runs down *is* the line between the verbs and the
              prompt. */}
          <ScrollCue href="#capabilities" />
        </div>
      </Container>
    </section>
  );
}
