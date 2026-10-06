import Image from "next/image";
import { Eye, Target, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

const NAVY = "16,46,84"; // #102e54

type Statement = {
  key: string;
  label: string;
  /** Optional — the statement can stand on its own. */
  title?: string;
  body: string;
  icon: LucideIcon;
  /** The accent, as "r,g,b", and its text class for the label. */
  accent: string;
  text: string;
};

const STATEMENTS: Statement[] = [
  {
    key: "purpose",
    label: "Our Purpose",
    body: "To transform enterprises through intelligent technology, engineering excellence, and business services.",
    icon: Target,
    accent: "245,159,19",
    text: "text-amber-300",
  },
  {
    key: "vision",
    label: "Our Vision",
    body: "To be the trusted global partner redefining how enterprises innovate, operate, and grow in the age of AI.",
    icon: Eye,
    accent: "68,158,216",
    text: "text-azure-300",
  },
];

const VALUES = [
  { title: "AI-Driven Innovation", desc: "AI built into how we work." },
  {
    title: "Client-Centric Mindset",
    desc: "Your outcomes set our priorities.",
  },
  { title: "Engineering Excellence", desc: "Rigorous, production-grade work." },
  { title: "Trust & Integrity", desc: "We do what we say — securely." },
  { title: "Ownership & Accountability", desc: "We own outcomes, end to end." },
  { title: "Continuous Learning", desc: "Always sharpening our craft." },
] as const;

/**
 * Vision & Mission, as one navy band: the head on the left, the two
 * statements as glass cards in the middle, and a photograph on the right
 * dissolving into the navy.
 */
export default function VisionMission() {
  return (
    <section
      aria-labelledby="about-vision"
      className="relative isolate overflow-hidden"
      style={{ background: `rgb(${NAVY})` }}
    >
      {/* The ground: the dark drafting grid and azure glows. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 grid-paper-dark opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 70% at 0% 20%, rgba(68,158,216,0.20), transparent 70%), radial-gradient(35% 60% at 55% 100%, rgba(68,158,216,0.10), transparent 70%)",
        }}
      />

      {/* The photograph, on the right from lg, fading left into the navy. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 hidden w-[30%] lg:block"
      >
        <Image
          src="/industries/enterprise.webp"
          alt=""
          fill
          quality={80}
          sizes="30vw"
          className="object-cover object-[60%_40%]"
        />
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgb(${NAVY}) 0%, rgba(${NAVY},0.85) 20%, rgba(${NAVY},0.5) 45%, rgba(${NAVY},0.15) 75%, rgba(${NAVY},0) 100%)`,
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(${NAVY},0.5) 0%, rgba(${NAVY},0) 30%, rgba(${NAVY},0) 70%, rgba(${NAVY},0.6) 100%)`,
          }}
        />
      </div>

      <Container wide className="relative py-8 sm:py-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)] lg:gap-12 lg:pr-[14%] xl:gap-16">
          {/* ---- The head ---- */}
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60">
                Purpose &amp; Values
              </span>
            </div>
            <h2 id="about-vision" className="mt-6 text-h3 text-paper">
              A purpose that guides us,{" "}
              <span className="text-sweep-dark">a vision that drives us.</span>
            </h2>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.7] text-paper/70">
              We&apos;re building a technology-driven future where innovation
              empowers businesses, people and communities to grow, connect and
              create lasting impact.
            </p>
          </div>

          <div>
            {/* ---- The statements ---- */}
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {STATEMENTS.map((s, i) => (
                <Wipe key={s.key} delay={0.08 + i * 0.08} className="h-full">
                  <StatementCard statement={s} index={i + 1} />
                </Wipe>
              ))}
            </div>

            {/* ---- The values, under the statements in the cards' label
                style. ---- */}
            <Wipe delay={0.24}>
              <div className="mt-8 flex items-center gap-3">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-azure-300">
                  Our Values
                </span>
                <span aria-hidden className="h-px flex-1 bg-paper/15" />
              </div>
              <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {VALUES.map((v) => (
                  <li key={v.title}>
                    <p className="text-[15px] font-semibold tracking-[-0.01em] text-paper">
                      {v.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-paper/60">
                      {v.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </Wipe>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StatementCard({
  statement: s,
  index,
}: {
  statement: Statement;
  index: number;
}) {
  const Icon = s.icon;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-paper/15 bg-paper/[0.04] p-6 transition-colors duration-500 hover:border-paper/30 hover:bg-paper/[0.07] lg:p-7">
      {/* The accent's glow behind the icon. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(45% 40% at 18% 18%, rgba(${s.accent},0.14), transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full border-2"
          style={{
            borderColor: `rgba(${s.accent},0.9)`,
            color: `rgb(${s.accent})`,
            boxShadow: `0 0 28px -6px rgba(${s.accent},0.6), inset 0 0 18px -8px rgba(${s.accent},0.6)`,
          }}
        >
          <Icon size={28} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="font-mono text-[34px] font-light leading-none tracking-[-0.04em] text-paper/25">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <span
          className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] ${s.text}`}
        >
          {s.label}
        </span>
        <span aria-hidden className="h-px flex-1 bg-paper/15" />
      </div>

      {s.title && (
        <h3 className="relative mt-3 text-[19px] font-semibold leading-[1.3] tracking-[-0.015em] text-paper lg:text-[20px]">
          {s.title}
        </h3>
      )}
      <span
        aria-hidden
        className="relative mt-4 block h-[2px] w-8 transition-all duration-500 ease-expo group-hover:w-14"
        style={{ background: `rgb(${s.accent})` }}
      />
      <p className="relative mt-4 text-[14px] leading-[1.7] text-paper/75">
        {s.body}
      </p>
    </article>
  );
}
