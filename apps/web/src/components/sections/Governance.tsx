import {
  ArrowRight,
  CircleCheck,
  FileCheck2,
  FileText,
  LockKeyhole,
  Settings,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";

/** The four things governance covers, as a ruled row beside the statement. */
const PILLARS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: "Information Security",
    desc: "Protecting your data and trust",
    icon: ShieldCheck,
  },
  {
    title: "Quality Management",
    desc: "Consistent and reliable delivery",
    icon: CircleCheck,
  },
  {
    title: "Risk Management",
    desc: "Identify, mitigate and monitor risks",
    icon: TriangleAlert,
  },
  {
    title: "Policies & Accountability",
    desc: "Defined controls and governance",
    icon: FileText,
  },
];

/**
 * The certifications, as the company holds them.
 *
 * `seal` is the monogram on the card's round seal. The certifying bodies'
 * own marks are trademarks, so the seal is drawn in the site's style rather
 * than reproducing them.
 */
const CERTIFICATIONS: {
  seal: string;
  name: string;
  scope: string;
  domain: string;
  icon: LucideIcon;
}[] = [
  {
    seal: "ISO",
    name: "ISO/IEC 27001:2022",
    scope: "Information Security Management System",
    domain: "Information Security & Risk Management",
    icon: LockKeyhole,
  },
  {
    seal: "ISO",
    name: "ISO 9001:2015",
    scope: "Quality Management System",
    domain: "Quality Management",
    icon: Settings,
  },
  {
    seal: "SOC 2",
    name: "SOC 2 Type II",
    scope: "Trust Services Criteria",
    domain: "Control Environment & Assurance",
    icon: FileCheck2,
  },
];

/**
 * Compliance and governance: the statement and its four pillars, then the
 * certifications beside a drawn shield. Sits on the grid-paper band the
 * detail pages use for their statements.
 */
export default function Governance({
  id = "governance",
  variant = "detail",
}: {
  id?: string;
  /** Matches the page it sits on. `home` takes the home page's section
      heading (large, words rising in, the second line swept in the logo's
      gradient) and its tighter padding; `detail` the detail pages' plainer
      heading and roomier padding. */
  variant?: "home" | "detail";
}) {
  const home = variant === "home";
  const padding = home ? "py-12 sm:py-16 lg:py-20" : "py-16 lg:py-24";
  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

      <Container wide className={cn("relative z-10", padding)}>
        {/* ---- Statement and pillars. ---- */}
        {/* Statement on the left, the four pillars beside it on the right,
            top-aligned. The home page's larger heading gets the wider share. */}
        <div
          className={cn(
            "grid gap-12 lg:items-start lg:gap-16",
            home
              ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
          )}
        >
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Compliance &amp; Governance
              </span>
            </div>
            {home ? (
              <h2 id={id} className="mt-6 text-h2 text-ink">
                <KineticWords text="Built on trust." />
                <br />
                <KineticWords
                  text="Governed for a"
                  delay={0.12}
                  wordClassName="text-sweep"
                />{" "}
                {/* Beside the pillars the column is too narrow for the second
                    line whole, and left to wrap it strands "tomorrow." on its
                    own; this breaks it evenly instead. Full width below lg. */}
                <br className="hidden lg:inline" />
                <KineticWords
                  text="safer tomorrow."
                  delay={0.2}
                  wordClassName="text-sweep"
                />
              </h2>
            ) : (
              <h2 id={id} className="mt-6 text-h3 text-ink">
                Built on trust.
                <br />
                <span className="text-azure-ink">
                  Governed for a safer tomorrow.
                </span>
              </h2>
            )}
            <Wipe delay={home ? 0.2 : 0}>
              <p
                className={cn(
                  "mt-6 max-w-[58ch] text-ink-500",
                  home
                    ? "text-lg leading-[1.75]"
                    : "text-[16px] leading-[1.8] lg:text-[17px]",
                )}
              >
                We embed security, quality and responsible governance into how
                we design, develop and deliver technology.
              </p>
            </Wipe>
          </div>

          {/* Dropped by the eyebrow's height, so the row starts level with
              the heading rather than the label above it. */}
          <ul className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:mt-10">
            {PILLARS.map(({ title, desc, icon: Icon }, i) => (
              <li key={title} className="border-l border-line pl-5 pr-3">
                <Wipe delay={i * 0.06}>
                  <span className="flex h-11 w-11 items-center justify-center border border-azure/30 bg-azure/10 text-azure-ink">
                    <Icon size={19} strokeWidth={1.6} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[15.5px] font-medium leading-snug tracking-[-0.01em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-500">
                    {desc}
                  </p>
                </Wipe>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- Certifications, and the shield. ---- */}
        <div className="mt-4 grid gap-12 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center xl:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <p className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              Our Certifications
            </p>

            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {CERTIFICATIONS.map((cert, i) => (
                <li key={cert.name} className="h-full">
                  <Wipe delay={i * 0.06} className="h-full">
                    <Frame
                      className="h-full"
                      innerClassName="flex h-full flex-col p-5"
                    >
                      <div className="flex items-center gap-4">
                        <Seal label={cert.seal} />
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold leading-snug tracking-[-0.015em] text-ink">
                            {cert.name}
                          </p>
                          <p className="mt-1 text-[13px] leading-snug text-ink-500">
                            {cert.scope}
                          </p>
                        </div>
                      </div>
                      {/* The foot is pinned to the bottom at a fixed height,
                          so a label that wraps to two lines doesn't lift its
                          rule out of line with the cards beside it. */}
                      <div className="mt-auto pt-5">
                        <p className="flex min-h-[56px] items-start gap-2.5 border-t border-line pt-4 text-[12.5px] font-medium leading-snug text-azure-ink">
                          <cert.icon
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden
                            className="mt-px flex-none"
                          />
                          {cert.domain}
                        </p>
                      </div>
                    </Frame>
                  </Wipe>
                </li>
              ))}
            </ul>

            {/* <a
              href="/contact"
              className="group mt-10 inline-flex min-h-[46px] items-center gap-2.5 rounded-sm bg-ink px-6 py-3 text-[14px] font-medium tracking-[-0.01em] text-paper transition-colors duration-300 hover:bg-ink-900"
            >
              Learn more about our governance
              <ArrowRight
                size={15}
                aria-hidden
                className="transition-transform duration-300 ease-expo group-hover:translate-x-1"
              />
            </a> */}
          </div>

          <ShieldArt className="mx-auto hidden w-full max-w-[250px] lg:block" />
        </div>
      </Container>
    </section>
  );
}

/** A certificate's round seal: a ringed azure disc with the monogram. */
function Seal({ label }: { label: string }) {
  return (
    <span className="relative flex h-14 w-14 flex-none items-center justify-center rounded-full border border-azure/30 bg-paper-white">
      <span className="absolute inset-1 rounded-full border border-dashed border-azure/40" />
      <span className="relative font-mono text-[11px] font-bold tracking-[0.04em] text-azure-ink">
        {label}
      </span>
    </span>
  );
}

/**
 * The shield on its plinth, drawn in the service stack's slab language: an
 * azure face over a rounded plinth, a lock at its centre, two document tiles
 * standing off it. Static on purpose — no animation to cost a frame while the
 * page scrolls past.
 */
function ShieldArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 330"
      role="img"
      aria-label="A shield with a lock, standing on a plinth"
      className={className}
    >
      <defs>
        <linearGradient id="gov-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8CC6EE" />
          <stop offset="100%" stopColor="#2A73B8" />
        </linearGradient>
        <linearGradient id="gov-shield-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="gov-plinth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D5E6F4" />
        </linearGradient>
        <linearGradient id="gov-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E3EFF9" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="gov-ground">
          <stop offset="30%" stopColor="#1B4F82" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1B4F82" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Orbit rings. */}
      <ellipse
        cx="180"
        cy="238"
        rx="168"
        ry="44"
        fill="none"
        stroke="#449ED8"
        strokeOpacity="0.22"
      />
      <ellipse
        cx="180"
        cy="238"
        rx="132"
        ry="32"
        fill="none"
        stroke="#449ED8"
        strokeOpacity="0.3"
        strokeDasharray="3 5"
      />
      <circle cx="330" cy="222" r="6" fill="#449ED8" fillOpacity="0.55" />
      <circle cx="40" cy="256" r="4.5" fill="#449ED8" fillOpacity="0.45" />

      {/* Ground shadow and the two-tier plinth. */}
      <ellipse cx="180" cy="296" rx="140" ry="18" fill="url(#gov-ground)" />
      <path
        d="M86 262 a94 22 0 0 0 188 0 v-14 a94 22 0 0 1 -188 0 z"
        fill="#B9D6EE"
      />
      <ellipse
        cx="180"
        cy="248"
        rx="94"
        ry="22"
        fill="url(#gov-plinth)"
        stroke="#FFFFFF"
      />
      <path
        d="M112 244 a68 15 0 0 0 136 0 v-10 a68 15 0 0 1 -136 0 z"
        fill="#A6CBEA"
      />
      <ellipse
        cx="180"
        cy="234"
        rx="68"
        ry="15"
        fill="url(#gov-plinth)"
        stroke="#FFFFFF"
      />

      {/* Document tiles, one either side. */}
      <g transform="rotate(-8 70 130)">
        <rect
          x="42"
          y="92"
          width="58"
          height="76"
          rx="8"
          fill="url(#gov-tile)"
          stroke="#BCD7EE"
        />
        <rect
          x="55"
          y="108"
          width="32"
          height="42"
          rx="4"
          fill="none"
          stroke="#449ED8"
          strokeWidth="2.5"
        />
        <path
          d="M62 120 h18 M62 128 h18 M62 136 h12"
          stroke="#449ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(7 292 150)">
        <rect
          x="262"
          y="118"
          width="60"
          height="70"
          rx="8"
          fill="url(#gov-tile)"
          stroke="#BCD7EE"
        />
        <circle
          cx="286"
          cy="144"
          r="7"
          fill="none"
          stroke="#449ED8"
          strokeWidth="2.5"
        />
        <path
          d="M274 168 a12 10 0 0 1 24 0"
          fill="none"
          stroke="#449ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="303"
          cy="140"
          r="6"
          fill="none"
          stroke="#449ED8"
          strokeWidth="2.5"
        />
        <path
          d="M298 160 a9 8 0 0 1 15 4"
          fill="none"
          stroke="#449ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* The shield: a pale back plate, the face, a bright rim. */}
      <path
        d="M180 36 L256 64 V128 C256 178 224 212 180 232 C136 212 104 178 104 128 V64 Z"
        fill="#CFE4F5"
        transform="translate(10 6)"
        opacity="0.8"
      />
      <path
        d="M180 36 L256 64 V128 C256 178 224 212 180 232 C136 212 104 178 104 128 V64 Z"
        fill="url(#gov-shield)"
      />
      <path
        d="M180 50 L243 73 V128 C243 170 216 199 180 217 C144 199 117 170 117 128 V73 Z"
        fill="none"
        stroke="url(#gov-shield-rim)"
        strokeWidth="2"
      />

      {/* The lock. */}
      <path
        d="M164 128 v-12 a16 16 0 0 1 32 0 v12"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="152" y="126" width="56" height="46" rx="8" fill="#FFFFFF" />
      <circle cx="180" cy="145" r="6" fill="#2A73B8" />
      <rect x="177" y="148" width="6" height="12" rx="3" fill="#2A73B8" />
    </svg>
  );
}
