import {
  Briefcase,
  Users,
  Building2,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import { TrustedStrip } from "@/components/sections/Clients";
import { cn } from "@/lib/utils";
import { KineticWords } from "../ui/Kinetic";

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  unit?: string;
  label: string;
  desc: string;
  /** Counts up from zero unless this says otherwise. A year isn't a quantity —
      rolling 0 → 2018 reads as a tally of something rather than a date, and
      spends two seconds showing years the company didn't exist in. */
  count?: boolean;
};

const STATS: Stat[] = [
  {
    icon: Briefcase,
    value: 500,
    suffix: "+",
    label: "Projects Delivered",
    desc: "Successful projects delivered across industries worldwide.",
  },
  {
    icon: Users,
    value: 200,
    suffix: "+",
    label: "Engineers & Specialists",
    desc: "Experienced engineers and AI specialists.",
  },
  {
    icon: Building2,
    value: 17,
    suffix: "K",
    unit: "sq ft",
    label: "Engineering Facility",
    desc: "State-of-the-art delivery & innovation center.",
  },
  {
    icon: CalendarDays,
    value: 2018,
    suffix: "",
    count: false,
    label: "Founded",
    desc: "Building and running enterprise platforms since 2018.",
  },
];

/** A stylised wireframe globe with two orbits — decorative, sits behind the
    card's middle. Static, so this stays a server component. */
function GlobeMotif() {
  return (
    <svg viewBox="0 0 420 420" width="360" height="360" fill="none" aria-hidden>
      <defs>
        <pattern
          id="pf-dots"
          width="8.5"
          height="8.5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.4" cy="1.4" r="1.15" fill="#63696B" fillOpacity="0.3" />
        </pattern>
        <clipPath id="pf-globe">
          <circle cx="210" cy="210" r="132" />
        </clipPath>
      </defs>

      {/* Dotted sphere. */}
      <g clipPath="url(#pf-globe)">
        <rect x="78" y="78" width="264" height="264" fill="url(#pf-dots)" />
      </g>
      <circle cx="210" cy="210" r="132" stroke="#CDD2C9" strokeWidth="1" />

      {/* Meridians. */}
      <ellipse
        cx="210"
        cy="210"
        rx="52"
        ry="132"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.6"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="104"
        ry="132"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Parallels. */}
      <ellipse
        cx="210"
        cy="210"
        rx="132"
        ry="40"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.5"
      />
      <ellipse
        cx="210"
        cy="170"
        rx="118"
        ry="30"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.35"
      />
      <ellipse
        cx="210"
        cy="250"
        rx="118"
        ry="30"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.35"
      />

      {/* Orbits + nodes. */}
      <ellipse
        cx="210"
        cy="210"
        rx="188"
        ry="88"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.55"
        transform="rotate(-24 210 210)"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="176"
        ry="66"
        stroke="#F9C777"
        strokeWidth="1"
        opacity="0.45"
        transform="rotate(20 210 210)"
      />
      <circle cx="366" cy="150" r="4.5" fill="#449ED8" />
      <circle cx="66" cy="256" r="4" fill="#F59F13" />
    </svg>
  );
}

export default function Proof() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-14 sm:py-20 lg:py-24">
        <div className="relative overflow-hidden bg-paper p-8 pb-0 shadow-[0_2px_28px_-14px_rgba(20,30,50,0.16)] lg:p-14 lg:pb-0">
          {/* Globe motif behind the middle. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 opacity-50 lg:block xl:left-[46%]">
            <GlobeMotif />
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16">
            {/* Left — about. */}
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-10 flex-none bg-amber" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                  About Funavry
                </span>
              </div>
              {/* <h2 className="mt-5 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
                Building Intelligent Enterprises with AI
              </h2> */}
              <h2 className="mt-6 text-h1 text-ink">
                <KineticWords text="Building Intelligent" />
                <br />
                <KineticWords text="Enterprises with AI" delay={0.12} />
              </h2>

              <p className="mt-6 text-[15px] leading-[1.75] text-ink-500">
                We help organizations modernize operations through AI,
                enterprise engineering, cloud, and intelligent automation
                delivering measurable business outcomes worldwide.
              </p>

              <div className="mt-9">
                <Button href="/#capabilities" variant="primary" size="md" arrow>
                  Learn More About Us
                </Button>
              </div>
            </div>

            {/* Right — the stats, a 2x2 with a hairline cross. Two-up on mobile
                too (was a single tall column): four confident numbers read as a
                stat block and halve the scroll. The `sm:` rules add the hairline
                cross back at tablet and up, unchanged. */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-y-0">
              {STATS.map((stat, i) => {
                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-col sm:py-8",
                      i % 2 === 0
                        ? "sm:pr-10"
                        : "sm:border-l sm:border-line sm:pl-10",
                      i >= 2 && "sm:border-t sm:border-line",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-line bg-paper text-ink shadow-[0_2px_8px_-4px_rgba(20,30,50,0.15)]">
                        <Icon size={20} strokeWidth={1.6} />
                      </span> */}
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-[clamp(30px,3.4vw,46px)] font-semibold leading-none tracking-[-0.03em] text-ink">
                          {stat.count === false ? (
                            `${stat.value}${stat.suffix}`
                          ) : (
                            <CountUp value={stat.value} suffix={stat.suffix} />
                          )}
                        </span>
                        {stat.unit && (
                          <span className="text-[15px] font-medium text-ink-400">
                            {stat.unit}
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-400">
                      {stat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* The trusted-partner strip, merged in at the foot of the section. */}
          <div className="relative z-10">
            <TrustedStrip />
          </div>
        </div>
      </Container>
    </section>
  );
}
