import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";
import type { Shot } from "@/lib/work-model";

export type WorkHeroStat = {
  value: number;
  suffix?: string;
  label: string;
  /** A year isn't a quantity — it's shown as-is rather than counted up. */
  count?: boolean;
};

/* Each column of the wall runs at its own pace and direction, so the grid
   never lines up into an obvious loop. */
const COLUMNS = [
  { anim: "animate-marquee-y", duration: "58s", offset: "mt-0" },
  { anim: "animate-marquee-y-reverse", duration: "72s", offset: "-mt-24" },
  { anim: "animate-marquee-y", duration: "64s", offset: "-mt-10" },
];

/**
 * The Work page's hero, on the same dark stage as the home page hero: the
 * aurora, the drafting grid and grain, and the headline rising in with pure
 * CSS so it paints before hydration.
 *
 * The right half is a tilted wall of real product captures from the case
 * studies, drifting up and down in three columns — the portfolio itself as
 * the backdrop, rather than an illustration of one. On a phone the wall
 * becomes a single sideways strip under the copy.
 *
 * `id="top"` is what the Nav watches to switch to its on-dark style.
 */
export default function WorkHero({
  shots,
  stats,
}: {
  /** Desktop captures for the wall, in display order. */
  shots: Shot[];
  stats: WorkHeroStat[];
}) {
  const columns = COLUMNS.map((c, i) => ({
    ...c,
    shots: shots.filter((_, s) => s % COLUMNS.length === i),
  }));

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink-900 pb-16 pt-[130px] lg:flex lg:min-h-[92svh] lg:flex-col lg:justify-center lg:pb-24"
    >
      {/* Aurora — desktop, animated. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden overflow-hidden lg:block"
      >
        <div className="absolute -left-[15%] -top-[20%] h-[75vh] w-[65vw] animate-aurora-a rounded-full bg-azure/25 blur-[130px]" />
        <div className="absolute -right-[10%] top-[10%] h-[60vh] w-[50vw] animate-aurora-b rounded-full bg-amber/[0.12] blur-[140px]" />
        <div className="absolute -bottom-[30%] left-[20%] h-[65vh] w-[60vw] animate-aurora-c rounded-full bg-steel/35 blur-[130px]" />
      </div>
      {/* Aurora — the phone's static version: a blurred circle is a radial
          gradient, at a fraction of the cost. */}
      <div
        aria-hidden
        className="absolute inset-0 lg:hidden"
        style={{
          background: [
            "radial-gradient(78% 58% at 10% 6%, rgba(68,158,216,0.28), transparent 62%)",
            "radial-gradient(62% 46% at 94% 14%, rgba(245,159,19,0.14), transparent 60%)",
            "radial-gradient(72% 58% at 46% 104%, rgba(55,96,121,0.38), transparent 66%)",
          ].join(","),
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />
      <div
        aria-hidden
        className="absolute inset-0 grain opacity-[0.16] mix-blend-overlay"
      />

      {/* The capture wall — desktop. Tilted in 3D and faded out at its top,
          bottom and inner edge so it reads as depth behind the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-[-6%] hidden w-[58%] lg:block"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, #000 22%), linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, #000 22%), linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      >
        <div
          className="absolute -inset-y-[20%] inset-x-0 grid grid-cols-3 gap-5"
          style={{
            transform:
              "perspective(1800px) rotateX(18deg) rotateY(-14deg) rotateZ(8deg)",
          }}
        >
          {columns.map((col, i) => (
            <div key={i} className={cn("min-w-0", col.offset)}>
              <div
                className={cn(
                  "flex flex-col gap-5 motion-reduce:animate-none",
                  col.anim,
                )}
                style={{ animationDuration: col.duration }}
              >
                {/* Twice over, so the loop's -50% lands where it began. */}
                {[...col.shots, ...col.shots].map((shot, s) => (
                  <Capture key={`${shot.src}-${s}`} shot={shot} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* A wash off the copy's side, so the headline keeps its contrast over
          whatever capture drifts behind it. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(33,38,42,0.92)_0%,rgba(33,38,42,0.7)_38%,transparent_62%)] lg:block"
      />

      <Container wide className="relative z-10">
        <div className="max-w-[640px]">
          <div
            className="hero-fade flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60 lg:text-[11px]"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="relative flex h-1.5 w-1.5 flex-none">
              <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-azure" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-azure" />
            </span>
            <span>Our Work · Case Studies</span>
            <span
              aria-hidden
              className="hidden h-px w-16 bg-paper/15 sm:block"
            />
          </div>

          <h1 className="mt-8 lg:mt-10">
            <span className="sr-only">
              Platforms in production, outcomes in the field.
            </span>
            {["Platforms in production,", "outcomes in the field."].map(
              (line, i) => (
                <span
                  key={line}
                  aria-hidden
                  className="-mb-[0.3em] block overflow-hidden pb-[0.3em]"
                >
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
              ),
            )}
          </h1>

          <p
            className="hero-fade mt-8 max-w-[48ch] text-[17px] leading-[1.7] text-paper/65 lg:text-[19px]"
            style={{ animationDelay: "0.24s" }}
          >
            We design, engineer and deploy digital products for organizations
            solving complex problems. From enterprise systems to AI-powered
            solutions, we turn ideas into reliable, scalable platforms.
          </p>

          <div
            className="hero-fade mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ animationDelay: "0.34s" }}
          >
            <Button
              variant="accent"
              size="lg"
              href="#work"
              arrow
              className="w-full sm:w-auto"
            >
              Explore the Work
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="#contact"
              arrow
              className="w-full sm:w-auto"
            >
              Start a Project
            </Button>
          </div>
        </div>
      </Container>

      {/* The capture strip — phone and tablet. */}
      <div
        aria-hidden
        className="relative z-10 mt-14 overflow-hidden lg:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-4 motion-reduce:animate-none">
          {[...shots, ...shots].map((shot, s) => (
            <div key={`${shot.src}-${s}`} className="w-[240px] flex-none">
              <Capture shot={shot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One capture in a browser-window frame, at its own shape — never cropped. */
function Capture({ shot }: { shot: Shot }) {
  return (
    <div className="overflow-hidden rounded-lg bg-ink-700 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-paper/10">
      <div className="flex h-5 items-center gap-1 bg-paper/[0.06] px-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-paper/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-paper/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-paper/25" />
      </div>
      <Image
        src={shot.src}
        alt=""
        width={shot.width}
        height={shot.height}
        sizes="(max-width: 1024px) 240px, 300px"
        className="block h-auto w-full"
      />
    </div>
  );
}
