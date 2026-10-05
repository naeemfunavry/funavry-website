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
  const padding = home ? "py-8 sm:py-12 lg:py-14" : "py-8 sm:py-12 lg:py-14";
  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#F8FBFE_0%,#EEF5FC_100%)]"
    >
      {/* A faint grid under two azure glows: one lifting the top right, one
          behind the shield, so the band reads light and clean, not flat. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 90% 8%, rgba(68,158,216,0.14), transparent 70%), radial-gradient(35% 50% at 86% 78%, rgba(68,158,216,0.16), transparent 70%)",
        }}
      />

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
                Security, quality and regulatory compliance backed by
                internationally recognized standards.
              </p>
            </Wipe>
          </div>

          {/* Dropped by the eyebrow's height, so the row starts level with
              the heading rather than the label above it. */}
          <ul className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:mt-10">
            {PILLARS.map(({ title, desc, icon: Icon }, i) => (
              <li
                key={title}
                className="group/pillar border-l border-azure/15 pl-5 pr-3"
              >
                <Wipe delay={i * 0.06}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-white to-azure-50 text-azure-ink shadow-[0_10px_24px_-12px_rgba(42,115,184,0.45)] ring-1 ring-azure/15 transition-transform duration-500 ease-expo group-hover/pillar:-translate-y-1">
                    <Icon size={20} strokeWidth={1.7} aria-hidden />
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
        <div className="mt-12 grid gap-12 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center xl:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <p className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              Our Certifications
            </p>

            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {CERTIFICATIONS.map((cert, i) => (
                <li key={cert.name} className="h-full">
                  <Wipe delay={i * 0.06} className="h-full">
                    <div className="flex h-full flex-col rounded-xl border border-azure/10 bg-white p-5 shadow-[0_22px_44px_-28px_rgba(27,79,130,0.45)] transition-[transform,box-shadow] duration-500 ease-expo hover:-translate-y-1 hover:shadow-[0_30px_56px_-28px_rgba(27,79,130,0.55)]">
                      <div className="flex items-center gap-4">
                        <Seal kind={cert.seal} />
                        <div className="min-w-0">
                          <p className="text-[16.5px] font-semibold leading-snug tracking-[-0.015em] text-ink">
                            {cert.name}
                          </p>
                          <p className="mt-1 text-[13px] leading-snug text-ink-500">
                            {cert.scope}
                          </p>
                        </div>
                      </div>
                      {/* A tinted chip pinned to the foot, so the cards line
                          up whatever their copy's length. */}
                      <div className="mt-auto pt-5">
                        <p className="flex min-h-[48px] items-center gap-2.5 rounded-lg bg-azure-50 px-3.5 py-2.5 text-[12.5px] font-medium leading-snug text-azure-ink">
                          <cert.icon
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden
                            className="flex-none"
                          />
                          {cert.domain}
                        </p>
                      </div>
                    </div>
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

          <ShieldArt className="mx-auto hidden w-full max-w-[300px] lg:block xl:max-w-[340px]" />
        </div>
      </Container>
    </section>
  );
}

/**
 * A certificate's seal, drawn in the site's azure rather than reproducing the
 * certifying bodies' trademarked marks. ISO: a ringed seal with a faint globe
 * behind the monogram. SOC 2: a solid azure disc with the report type.
 */
function Seal({ kind }: { kind: string }) {
  if (kind === "SOC 2") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden className="h-16 w-16 flex-none">
        <defs>
          <linearGradient id="seal-soc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5BB3EE" />
            <stop offset="1" stopColor="#1F5F9E" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#seal-soc)" />
        <circle
          cx="32"
          cy="32"
          r="25.5"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <text
          x="32"
          y="33"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="14"
          fontWeight="700"
          fontFamily="inherit"
        >
          SOC 2
        </text>
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fill="#FFFFFF"
          fillOpacity="0.8"
          fontSize="6.5"
          fontWeight="600"
          letterSpacing="1"
          fontFamily="inherit"
        >
          TYPE II
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-16 w-16 flex-none">
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="#FFFFFF"
        stroke="#CFE4F5"
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="25" fill="#F1F8FE" />
      {/* The globe, faint behind the monogram. */}
      <g fill="none" stroke="#449ED8" strokeOpacity="0.35" strokeWidth="1">
        <circle cx="32" cy="32" r="18" />
        <ellipse cx="32" cy="32" rx="8" ry="18" />
        <path d="M14 32 H50 M17 23 H47 M17 41 H47" />
      </g>
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fill="#1F5F9E"
        fontSize="17"
        fontWeight="800"
        letterSpacing="-0.5"
        fontFamily="inherit"
      >
        ISO
      </text>
    </svg>
  );
}

/**
 * The shield: glossy and azure, a lock at its heart, standing on a lit
 * two-tier plinth among frosted glass panels, floating tiles, orbit rings and
 * a few glowing spheres, all over a soft halo. Gradients only, no filters,
 * and static — nothing here costs a frame while the page scrolls.
 */
function ShieldArt({ className }: { className?: string }) {
  const shield =
    "M180 40 L262 70 V134 C262 186 228 222 180 244 C132 222 98 186 98 134 V70 Z";
  return (
    <svg
      viewBox="0 0 360 340"
      role="img"
      aria-label="A shield with a lock, standing on a plinth"
      className={className}
    >
      <defs>
        <radialGradient id="gov-halo" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#8CC8F5" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#B9DDF7" stopOpacity="0.18" />
          <stop offset="1" stopColor="#B9DDF7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gov-face" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#7CC2F4" />
          <stop offset="0.55" stopColor="#3A8BD6" />
          <stop offset="1" stopColor="#1D5A9C" />
        </linearGradient>
        <linearGradient id="gov-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gov-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#D4E8F9" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="gov-lock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DDEBF8" />
        </linearGradient>
        <linearGradient id="gov-plinth-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCEBF8" />
        </linearGradient>
        <linearGradient id="gov-plinth-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9CFEE" />
          <stop offset="1" stopColor="#7FB2DE" />
        </linearGradient>
        <radialGradient id="gov-sphere" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#E3F3FF" />
          <stop offset="0.5" stopColor="#7CC2F4" />
          <stop offset="1" stopColor="#2A73B8" />
        </radialGradient>
        <radialGradient id="gov-ground" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor="#1B4F82" stopOpacity="0.2" />
          <stop offset="1" stopColor="#1B4F82" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo. */}
      <circle cx="180" cy="160" r="160" fill="url(#gov-halo)" />

      {/* Frosted glass panels behind the shield. */}
      <rect
        x="196"
        y="34"
        width="112"
        height="160"
        rx="14"
        fill="url(#gov-glass)"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        transform="rotate(6 252 114)"
      />
      <rect
        x="214"
        y="58"
        width="104"
        height="150"
        rx="14"
        fill="url(#gov-glass)"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        opacity="0.8"
        transform="rotate(10 266 133)"
      />

      {/* Orbit rings. */}
      <ellipse
        cx="180"
        cy="256"
        rx="168"
        ry="44"
        fill="none"
        stroke="#449ED8"
        strokeOpacity="0.28"
      />
      <ellipse
        cx="180"
        cy="256"
        rx="132"
        ry="32"
        fill="none"
        stroke="#449ED8"
        strokeOpacity="0.35"
        strokeDasharray="3 6"
      />

      {/* Ground and the two-tier plinth, its top rims lit. */}
      <ellipse cx="180" cy="304" rx="150" ry="20" fill="url(#gov-ground)" />
      <path
        d="M72 276 a108 26 0 0 0 216 0 v-16 a108 26 0 0 1 -216 0 z"
        fill="url(#gov-plinth-side)"
      />
      <ellipse
        cx="180"
        cy="260"
        rx="108"
        ry="26"
        fill="url(#gov-plinth-top)"
        stroke="#8CC8F5"
        strokeWidth="1.5"
      />
      <path
        d="M106 256 a74 17 0 0 0 148 0 v-12 a74 17 0 0 1 -148 0 z"
        fill="url(#gov-plinth-side)"
      />
      <ellipse
        cx="180"
        cy="244"
        rx="74"
        ry="17"
        fill="url(#gov-plinth-top)"
        stroke="#8CC8F5"
        strokeWidth="1.5"
      />

      {/* The shield: a glass back plate, the glossy face, its sheen and rim. */}
      <path
        d={shield}
        fill="#CFE4F5"
        opacity="0.75"
        transform="translate(12 8)"
      />
      <path d={shield} fill="url(#gov-face)" />
      <path
        d="M180 52 L110 78 V134 C110 176 136 208 180 230 Z"
        fill="url(#gov-sheen)"
      />
      <path
        d="M180 54 L249 79 V134 C249 178 220 208 180 228 C140 208 111 178 111 134 V79 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="2"
      />

      {/* The lock, with a soft shadow under its body. */}
      <path
        d="M163 132 v-14 a17 17 0 0 1 34 0 v14"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect
        x="151"
        y="134"
        width="58"
        height="48"
        rx="9"
        fill="#10365F"
        opacity="0.25"
        transform="translate(0 4)"
      />
      <rect
        x="151"
        y="130"
        width="58"
        height="48"
        rx="9"
        fill="url(#gov-lock)"
      />
      <circle cx="180" cy="150" r="6.5" fill="#1F5F9E" />
      <rect x="177" y="153" width="6" height="13" rx="3" fill="#1F5F9E" />

      {/* Floating tiles: a document, and the people who hold it to account. */}
      <g transform="rotate(-9 64 128)">
        <rect
          x="34"
          y="88"
          width="62"
          height="80"
          rx="12"
          fill="url(#gov-glass)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <rect
          x="49"
          y="104"
          width="32"
          height="44"
          rx="5"
          fill="none"
          stroke="#2A73B8"
          strokeWidth="2.5"
        />
        <path
          d="M56 116 h18 M56 124 h18 M56 132 h11"
          stroke="#2A73B8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(8 300 172)">
        <rect
          x="268"
          y="136"
          width="64"
          height="74"
          rx="12"
          fill="url(#gov-glass)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <circle
          cx="292"
          cy="163"
          r="7.5"
          fill="none"
          stroke="#2A73B8"
          strokeWidth="2.5"
        />
        <path
          d="M279 189 a13 11 0 0 1 26 0"
          fill="none"
          stroke="#2A73B8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="310"
          cy="159"
          r="6.5"
          fill="none"
          stroke="#2A73B8"
          strokeWidth="2.5"
        />
        <path
          d="M305 178 a10 9 0 0 1 16 5"
          fill="none"
          stroke="#2A73B8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Glowing spheres. */}
      <circle cx="326" cy="96" r="9" fill="url(#gov-sphere)" />
      <circle cx="40" cy="230" r="7" fill="url(#gov-sphere)" />
      <circle cx="312" cy="270" r="5" fill="url(#gov-sphere)" />
      <circle cx="70" cy="60" r="4" fill="url(#gov-sphere)" opacity="0.8" />
    </svg>
  );
}
