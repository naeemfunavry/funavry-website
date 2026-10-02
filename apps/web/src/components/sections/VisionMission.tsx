import Image from "next/image";
import { Eye, Target, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

type Statement = {
  key: string;
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
  /** The icon tile and the label's colour. */
  tile: string;
  text: string;
};

const STATEMENTS: Statement[] = [
  {
    key: "vision",
    label: "01 · Where we're going",
    title: "Our Vision",
    body: "To be a global leader in AI-powered digital transformation, enabling organizations to unlock new possibilities and create a smarter, more connected and sustainable future.",
    icon: Eye,
    tile: "bg-azure text-paper shadow-[0_12px_28px_-10px_rgba(68,158,216,0.8)]",
    text: "text-azure-600",
  },
  {
    key: "mission",
    label: "02 · How we get there",
    title: "Our Mission",
    body: "To design, build and operate innovative software solutions that combine human expertise with AI, empowering businesses to achieve greater efficiency, resilience and growth.",
    icon: Target,
    tile: "bg-amber text-ink-900 shadow-[0_12px_28px_-10px_rgba(245,159,19,0.8)]",
    text: "text-amber-ink",
  },
];

/**
 * Vision & Mission, as an editorial split: a layered collage of the two
 * company photographs on the right — the team for the vision, the boardroom
 * for the mission — with a floating figure, and on the left the head and the
 * two statements on a numbered rail.
 */
export default function VisionMission() {
  return (
    <section
      aria-labelledby="about-vision"
      className="relative overflow-hidden border-b border-line bg-paper-white"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-50" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 60% at 0% 30%, rgba(68,158,216,0.10), transparent 70%), radial-gradient(35% 55% at 100% 90%, rgba(245,159,19,0.08), transparent 70%)",
        }}
      />

      <Container wide className="relative py-16 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {/* ---- The statements ---- */}
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Our Purpose
              </span>
            </div>
            <h2 id="about-vision" className="mt-6 text-h3 text-ink">
              Vision that guides us,
              <br />
              <span className="text-sweep">a mission that drives us.</span>
            </h2>

            <div className="relative mt-10">
              {/* The rail joining the two icons. */}
              <span
                aria-hidden
                className="absolute bottom-6 left-[23px] top-6 w-px bg-gradient-to-b from-azure via-line-strong to-amber"
              />
              <ol className="relative space-y-10">
                {STATEMENTS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.key} className="relative">
                      <Wipe delay={0.1 + i * 0.1}>
                        <div className="group flex gap-6">
                          <span
                            className={`relative z-10 flex h-12 w-12 flex-none items-center justify-center rounded-xl ring-4 ring-paper-white transition-transform duration-500 ease-expo group-hover:-rotate-6 group-hover:scale-105 ${s.tile}`}
                          >
                            <Icon size={22} strokeWidth={2} aria-hidden />
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p
                              className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${s.text}`}
                            >
                              {s.label}
                            </p>
                            <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink lg:text-[24px]">
                              {s.title}
                            </h3>
                            <p className="mt-3 max-w-[56ch] text-[15.5px] leading-[1.75] text-ink-500 lg:text-[16px]">
                              {s.body}
                            </p>
                          </div>
                        </div>
                      </Wipe>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* ---- The collage ---- */}
          <Wipe>
            <Collage />
          </Wipe>
        </div>
      </Container>
    </section>
  );
}

/** Two photographs layered — the vision large on the right, the mission
    overlapping its lower left, toward the copy — with offset plates behind
    and a floating figure. */
function Collage() {
  return (
    <div className="relative mx-auto max-w-[640px] pb-[22%] pl-[10%]">
      {/* Offset plates. */}
      <span
        aria-hidden
        className="absolute -right-5 -top-5 h-36 w-36 rounded-2xl grid-paper ring-1 ring-line-strong"
      />
      <span
        aria-hidden
        className="absolute bottom-[-18px] left-[-18px] h-[45%] w-[45%] rounded-2xl bg-azure/15 ring-1 ring-azure/25"
      />

      {/* Vision, large. */}
      <figure className="group relative ml-auto aspect-[4/3] w-[88%] overflow-hidden rounded-2xl bg-ink-900 shadow-[0_40px_80px_-40px_rgba(15,43,64,0.6)]">
        <Image
          src="/about/5.webp"
          alt="The Funavry team together on a lawn below green hills"
          fill
          quality={85}
          sizes="(max-width: 1024px) 80vw, 560px"
          className="object-cover object-[center_60%] transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.04]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.45)_0%,transparent_35%)]"
        />
        <figcaption className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink-900/40 py-1 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper ring-1 ring-paper/25 backdrop-blur-md">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azure">
            <Eye size={12} strokeWidth={2.4} aria-hidden />
          </span>
          Vision
        </figcaption>
      </figure>

      {/* Mission, overlapping toward the copy. */}
      <figure className="group absolute bottom-0 left-0 aspect-[4/3] w-[58%] overflow-hidden rounded-2xl bg-ink-900 shadow-[0_40px_80px_-36px_rgba(15,23,42,0.7)] ring-[6px] ring-paper-white">
        <Image
          src="/about/12.webp"
          alt="Funavry's leadership and engineers in a meeting around the boardroom table"
          fill
          quality={85}
          sizes="(max-width: 1024px) 55vw, 380px"
          className="object-cover object-[center_40%] transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.05]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.45)_0%,transparent_40%)]"
        />
        <figcaption className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-ink-900/40 py-1 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper ring-1 ring-paper/25 backdrop-blur-md">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber text-ink-900">
            <Target size={12} strokeWidth={2.4} aria-hidden />
          </span>
          Mission
        </figcaption>
      </figure>

      {/* A floating figure, low on the right. */}
      <div className="absolute bottom-[4%] right-[2%] rounded-xl bg-ink-900 px-5 py-4 text-paper shadow-[0_24px_48px_-20px_rgba(15,23,42,0.7)] ring-1 ring-white/10">
        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em]">
          500<span className="text-amber">+</span>
        </p>
        <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-paper/60">
          Projects since 2018
        </p>
      </div>
    </div>
  );
}
