"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  LayoutGrid,
  Network,
  Radio,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import type { Service } from "@/lib/services";
import type { Industry } from "@/lib/industries";
import { socialIcon, type SocialLink } from "@/lib/socials";
import { PHASE, SERVICE_ICONS, SERVICE_IMAGES } from "@/lib/service-style";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;

type Link = {
  label: string;
  href: string;
  /** A full-width mega panel keyed by content. */
  mega?: "services" | "industries";
  /** A small self-contained dropdown. */
  children?: { label: string; href: string; desc: string }[];
  /** Opens in a new tab. */
  newTab?: boolean;
};

/* Rooted at "/", not bare fragments: the bar also flies over /case-studies, and
   "#work" from there scrolls to nothing. On the home page a same-document
   fragment still resolves as a jump, so nothing changes there. */
const LINKS: Link[] = [
  { label: "Services", href: "/services", mega: "services" },
  { label: "Industries", href: "/industries", mega: "industries" },
  { label: "Our Work", href: "/case-studies", newTab: false },
  // { label: "Case Studies", href: "/case-studies" },
  {
    label: "Company",
    href: "/about",
    children: [
      {
        label: "About Us",
        href: "/about",
        desc: "Who we are and how we deliver",
      },
      { label: "Contact Us", href: "/contact", desc: "Talk to our team" },
      {
        label: "Careers",
        href: "/#careers",
        desc: "Build with a team of 200+",
      },
      { label: "Blog", href: "", desc: "Engineering & AI writing" },
      { label: "News", href: "", desc: "Announcements and press" },
    ],
  },
];

/** Flat sub-item list for the mobile accordion, derived from either a mega or a
    small dropdown. */
function subItemsFor(
  link: Link,
  services: Service[],
  industries: Industry[],
): { label: string; href: string }[] | null {
  if (link.children)
    return link.children.map((c) => ({ label: c.label, href: c.href }));
  if (link.mega === "services")
    return services.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
    }));
  if (link.mega === "industries")
    return industries.map((i) => ({
      label: i.name,
      href: `/industries/${i.slug}`,
    }));
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Mega panels                                                               */
/* -------------------------------------------------------------------------- */

const PAD = "px-5 sm:px-6 md:px-10 lg:px-14";

/** A glyph per industry, keyed by slug; anything new falls back to Layers. */
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  healthcare: HeartPulse,
  "financial-services": Landmark,
  media: Radio,
  government: Building2,
  "supply-chain": Truck,
  manufacturing: Factory,
  "industrial-iot": Cpu,
  education: GraduationCap,
  commerce: ShoppingBag,
  "enterprise-systems": Network,
};

/* The three logo hues, cycled down the industry list. */
const TINTS = ["68,158,216", "245,159,19", "55,96,121"] as const;

/* The Services card's photograph before anything is hovered, and for a
   practice with none of its own (the business services). */
const SERVICES_PHOTO = "/services/ai-automation.webp";
const SERVICES_FALLBACK_PHOTO = "/services/digital-engineering.webp";

/**
 * The mega panel's feature card: a photograph fading into ink, and over it
 * whatever the pointer is on — or the panel's own pitch until then. The
 * photograph crossfades as the pointer moves down the list.
 */
function FeatureCard({
  photo,
  eyebrow,
  title,
  body,
  meta,
  cta,
  onNavigate,
}: {
  photo: string;
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
  cta: { label: string; href: string };
  onNavigate: () => void;
}) {
  return (
    <div className="relative flex min-h-[360px] flex-col justify-end overflow-hidden bg-ink-900 p-7">
      <AnimatePresence initial={false}>
        <motion.div
          key={photo}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EXPO }}
          className="absolute inset-0"
        >
          <Image
            src={photo}
            alt=""
            fill
            sizes="340px"
            quality={85}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,#21262A_0%,rgba(33,38,42,0.82)_42%,rgba(33,38,42,0.25)_100%)]"
      />
      <span aria-hidden className="absolute inset-0 grid-paper-dark opacity-60" />
      <span aria-hidden className="absolute left-0 top-0 h-[3px] w-20 bg-amber" />

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EXPO }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
              {eyebrow}
            </p>
            <p className="mt-3 text-[21px] font-medium leading-snug tracking-[-0.02em] text-paper">
              {title}
            </p>
            <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-paper/65">
              {body}
            </p>
            {meta && (
              <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/45">
                {meta}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        <a
          href={cta.href}
          onClick={onNavigate}
          className="group mt-6 inline-flex min-h-[40px] items-center gap-2 bg-amber px-4 text-[13px] font-semibold text-ink-900 transition-colors duration-300 hover:bg-amber-600"
        >
          {cta.label}
          <ArrowRight
            size={14}
            aria-hidden
            className="transition-transform duration-300 ease-expo group-hover:translate-x-1"
          />
        </a>
      </div>
    </div>
  );
}

/** One row in a mega list: an icon tile, the name, and a quiet second line.
    The tile fills with the row's hue on hover. */
function MegaItem({
  href,
  Icon,
  tint,
  title,
  sub,
  onNavigate,
  onHover,
}: {
  href: string;
  Icon: LucideIcon;
  /** "r,g,b" the tile lights to on hover. */
  tint: string;
  title: string;
  sub?: string;
  onNavigate: () => void;
  onHover: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      onMouseEnter={onHover}
      onFocus={onHover}
      style={{ "--tint": tint } as React.CSSProperties}
      className="group flex items-center gap-3.5 border border-transparent p-2.5 transition-colors duration-300 hover:border-line hover:bg-paper"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center border border-line bg-paper-white text-ink-500 transition-colors duration-300 group-hover:border-[rgb(var(--tint))] group-hover:bg-[rgb(var(--tint))] group-hover:text-paper">
        <Icon size={17} strokeWidth={1.6} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium leading-snug tracking-[-0.01em] text-ink">
          {title}
        </span>
        {sub && (
          <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
            {sub}
          </span>
        )}
      </span>
      <ArrowRight
        size={14}
        aria-hidden
        className="ml-auto flex-none -translate-x-1 text-ink-400 opacity-0 transition-all duration-300 ease-expo group-hover:translate-x-0 group-hover:opacity-100"
      />
    </a>
  );
}

function GroupLabel({ children, hue }: { children: string; hue: string }) {
  return (
    <p className="flex items-center gap-3 border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
      <span aria-hidden className={cn("h-px w-6 flex-none", hue)} />
      {children}
    </p>
  );
}

function ServicesMega({
  services,
  onNavigate,
}: {
  services: Service[];
  onNavigate: () => void;
}) {
  const tech = services.filter((s) => s.group === "tech");
  const gbs = services.filter((s) => s.group === "gbs");
  const [hovered, setHovered] = useState<Service | null>(null);

  const item = (s: Service) => (
    <li key={s.slug}>
      <MegaItem
        href={`/services/${s.slug}`}
        Icon={SERVICE_ICONS[s.icon] ?? LayoutGrid}
        tint={PHASE[s.phase].tint}
        title={s.title}
        sub={s.phase}
        onNavigate={onNavigate}
        onHover={() => setHovered(s)}
      />
    </li>
  );

  const photo = hovered
    ? (SERVICE_IMAGES[hovered.slug] ?? SERVICES_FALLBACK_PHOTO)
    : SERVICES_PHOTO;

  return (
    <div className={cn("mx-auto w-full max-w-wide py-8", PAD)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
        <FeatureCard
          photo={photo}
          eyebrow={
            hovered
              ? `${hovered.phase} · ${hovered.group === "tech" ? "Engineering" : "Business Services"}`
              : "Services"
          }
          title={hovered ? hovered.title : "Sixteen practices, one delivery model."}
          body={
            hovered
              ? hovered.summary
              : "Ten technology & engineering practices and six global business services, with AI running through both."
          }
          cta={
            hovered
              ? { label: "View service", href: `/services/${hovered.slug}` }
              : { label: "Explore all services", href: "/services" }
          }
          onNavigate={onNavigate}
        />

        <div
          onMouseLeave={() => setHovered(null)}
          className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        >
          <div>
            <GroupLabel hue="bg-azure">Technology &amp; Engineering</GroupLabel>
            <ul className="mt-3 grid gap-x-2 gap-y-0.5 sm:grid-cols-2">
              {tech.map(item)}
            </ul>
          </div>
          <div>
            <GroupLabel hue="bg-amber">Global Business Services</GroupLabel>
            <ul className="mt-3 grid gap-x-2 gap-y-0.5 sm:grid-cols-2 xl:grid-cols-1">
              {gbs.map(item)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndustriesMega({
  industries,
  onNavigate,
}: {
  industries: Industry[];
  onNavigate: () => void;
}) {
  const [hovered, setHovered] = useState<Industry | null>(null);
  const photo = (hovered ?? industries[0])?.image;

  return (
    <div className={cn("mx-auto w-full max-w-wide py-8", PAD)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
        {photo && (
          <FeatureCard
            photo={photo}
            eyebrow={hovered ? "Industry" : "Industries"}
            title={hovered ? hovered.name : "Ten industries, deep domain fluency."}
            body={
              hovered
                ? hovered.desc
                : "Five hundred delivered projects across the sectors we know cold."
            }
            meta={hovered?.proof}
            cta={
              hovered
                ? { label: "View industry", href: `/industries/${hovered.slug}` }
                : { label: "Explore all industries", href: "/industries" }
            }
            onNavigate={onNavigate}
          />
        )}

        <div onMouseLeave={() => setHovered(null)}>
          <GroupLabel hue="bg-azure">Industries we serve</GroupLabel>
          <ul className="mt-3 grid gap-x-2 gap-y-0.5 sm:grid-cols-2 xl:grid-cols-3">
            {industries.map((ind, i) => (
              <li key={ind.slug}>
                <MegaItem
                  href={`/industries/${ind.slug}`}
                  Icon={INDUSTRY_ICONS[ind.slug] ?? Layers}
                  tint={TINTS[i % TINTS.length]}
                  title={ind.name}
                  sub={ind.proof}
                  onNavigate={onNavigate}
                  onHover={() => setHovered(ind)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small "Company" dropdown                                                  */
/* -------------------------------------------------------------------------- */

function Dropdown({ link, onDark }: { link: Link; onDark: boolean }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onFocus={show}
        className="group relative flex items-center gap-1.5 py-2"
      >
        <span
          className={cn(
            "text-[14.5px] font-medium tracking-[-0.01em] transition-colors",
            onDark
              ? "text-paper/70 group-hover:text-paper"
              : "text-ink-500 group-hover:text-ink",
          )}
        >
          {link.label}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-300 ease-expo",
            onDark ? "text-paper/50" : "text-ink-400",
            open && "rotate-180",
          )}
        />
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-0 h-px w-[calc(100%-18px)] origin-right scale-x-0 bg-azure transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 8, clipPath: "inset(0% 0% 100% 0%)" }
            }
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.35, ease: EXPO }}
            className="absolute left-1/2 top-full w-[280px] -translate-x-1/2 pt-3"
          >
            <div className="relative border border-line bg-paper-white shadow-[0_18px_50px_-20px_rgba(46,52,54,0.35)]">
              <span
                aria-hidden
                className="absolute -left-px -top-px h-2.5 w-2.5 border-l border-t border-azure"
              />
              <span
                aria-hidden
                className="absolute -right-px -top-px h-2.5 w-2.5 border-r border-t border-azure"
              />
              {link.children?.map((child) => (
                <a
                  key={child.label}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="group/i flex flex-col gap-0.5 border-b border-line-soft px-5 py-4 transition-colors last:border-b-0 hover:bg-paper"
                >
                  <span className="flex items-center gap-2 text-[14px] font-medium text-ink">
                    <span
                      aria-hidden
                      className="h-px w-0 bg-azure transition-all duration-400 ease-expo group-hover/i:w-3"
                    />
                    {child.label}
                  </span>
                  <span className="text-[12px] leading-snug text-ink-400">
                    {child.desc}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Nav data arrives as props.
 *
 * The mega-menu lists every practice and every industry, and both now live in
 * the CMS — so the pages fetch them and hand them down rather than this client
 * component importing a constant that no longer exists.
 */
export interface NavProps {
  services: Service[];
  industries: Industry[];
  socials: SocialLink[];
}

export default function Nav({ services, industries, socials }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [mega, setMega] = useState<null | "services" | "industries">(null);
  const megaTimer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  const openMega = (k: "services" | "industries") => {
    window.clearTimeout(megaTimer.current);
    setMega(k);
  };
  const closeMega = () => {
    megaTimer.current = window.setTimeout(() => setMega(null), 140);
  };
  useEffect(() => () => window.clearTimeout(megaTimer.current), []);

  /* Lenis drives the page, so this fires on every animation frame of every
     scroll — it is the most frequently run code on the site and has to do as
     little as possible.

     Two things it used to do per frame: dispatch `setScrolled` with a freshly
     computed boolean, and dispatch `setMega(null)` unconditionally. React bails
     out of an identical value, but the bail-out happens after the dispatch, so
     both still entered the scheduler ~60 times a second for the ~99% of frames
     that cross no threshold and have no menu open.

     Now the frame does one `scrollY` read and two comparisons against refs, and
     touches React only on the frames where something actually changed. */
  const scrolledRef = useRef(false);
  const megaRef = useRef<null | "services" | "industries">(null);
  megaRef.current = mega;

  useEffect(() => {
    let ticking = false;

    const read = () => {
      ticking = false;
      const next = window.scrollY > 20;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
      // Scrolling dismisses an open mega menu — but only if one is open.
      if (megaRef.current !== null) setMega(null);
    };

    /* rAF-coalesced: a scroll burst that fires several events inside one frame
       collapses to a single read, and the read lands in the frame that will
       paint it rather than ahead of it. */
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMega(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Scroll distance can't tell us this: the hero is 100svh, so the bar sits on
     the dark stage long after the 20px `scrolled` threshold. Watch the hero
     itself, inset by the bar's own height. */
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) {
      setOverHero(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: "-76px 0px 0px 0px", threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  /* The mobile sheet is paper, so the bar goes back to ink while it is open.
     A mega panel is also paper, so the same rule applies while one is open. */
  const onDark = overHero && !open && !mega;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { y: -28, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EXPO, delay: 0.15 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 border-b transition-all duration-500",
          onDark ? "glass-dark" : "glass",
          scrolled || mega ? "opacity-100" : "opacity-0",
          !scrolled && !mega
            ? "border-transparent"
            : onDark
              ? "border-paper/10"
              : "border-line",
        )}
      />

      <div className="relative mx-auto flex h-[76px] w-full max-w-wide items-center justify-between px-5 sm:px-6 md:px-10 lg:px-14">
        <a
          href="/"
          aria-label="Funavry Technologies home"
          className={cn(
            "transition-colors duration-500",
            onDark ? "text-paper" : "text-ink",
          )}
        >
          <Logo className="h-[30px]" onDark={onDark} />
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => {
            if (link.children) {
              return <Dropdown key={link.label} link={link} onDark={onDark} />;
            }
            if (link.mega) {
              const isOpen = mega === link.mega;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => openMega(link.mega!)}
                  onMouseLeave={closeMega}
                  onFocus={() => openMega(link.mega!)}
                  onClick={() => setMega(null)}
                  aria-expanded={isOpen}
                  className="group relative flex items-center gap-1.5 py-2"
                >
                  <span
                    className={cn(
                      "text-[14.5px] font-medium tracking-[-0.01em] transition-colors",
                      onDark
                        ? "text-paper/70 group-hover:text-paper"
                        : "text-ink-500 group-hover:text-ink",
                    )}
                  >
                    {link.label}
                  </span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform duration-300 ease-expo",
                      onDark ? "text-paper/50" : "text-ink-400",
                      isOpen && "rotate-180",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px w-[calc(100%-18px)] origin-right bg-azure transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100",
                      isOpen ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              );
            }
            return (
              <a
                key={link.href}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                className="group relative py-2"
              >
                <span
                  className={cn(
                    "text-[14.5px] font-medium tracking-[-0.01em] transition-colors",
                    onDark
                      ? "text-paper/70 group-hover:text-paper"
                      : "text-ink-500 group-hover:text-ink",
                  )}
                >
                  {link.label}
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-azure transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100"
                />
              </a>
            );
          })}
        </nav>

        {/* Right cluster — socials + CTA. */}
        <div className="hidden items-center gap-4 lg:flex">
          <div className="flex items-center gap-0.5">
            {socials.map((s) => {
              const Icon = socialIcon(s.icon);
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Funavry on ${s.label}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center transition-colors duration-300",
                    onDark
                      ? "text-paper/55 hover:bg-paper/10 hover:text-paper"
                      : "text-ink-400 hover:bg-paper-white hover:text-ink",
                  )}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
          <Button
            href="/#contact"
            variant={onDark ? "paper" : "accent"}
            size="sm"
            arrow
          >
            Let&apos;s Build Together
          </Button>
        </div>

        {/* Mobile trigger — two rules that cross. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={cn(
            "relative flex h-11 w-11 items-center justify-center border transition-colors duration-500 lg:hidden",
            onDark
              ? "border-paper/20 bg-paper/[0.06]"
              : "border-line bg-paper-white",
          )}
        >
          <span className="relative block h-3 w-4">
            <span
              className={cn(
                "absolute left-0 block h-px w-full transition-all duration-400 ease-expo",
                onDark ? "bg-paper" : "bg-ink",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-px w-full transition-all duration-400 ease-expo",
                onDark ? "bg-paper" : "bg-ink",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </div>

      {/* Full-width mega panel. */}
      <AnimatePresence>
        {mega && (
          <motion.div
            key={mega}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EXPO }}
            onMouseEnter={() => openMega(mega)}
            onMouseLeave={closeMega}
            className="absolute inset-x-0 top-full hidden border-y border-line bg-paper-white/[0.97] shadow-[0_40px_80px_-30px_rgba(46,52,54,0.35)] backdrop-blur-xl lg:block"
          >
            {mega === "services" ? (
              <ServicesMega services={services} onNavigate={() => setMega(null)} />
            ) : (
              <IndustriesMega industries={industries} onNavigate={() => setMega(null)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheet. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: EXPO }}
            className="fixed inset-0 top-[76px] z-40 overflow-y-auto bg-paper lg:hidden"
          >
            <div aria-hidden className="absolute inset-0 grid-paper" />
            <nav className="relative flex flex-col px-6 pb-16 pt-6">
              {LINKS.map((link, i) => {
                const subs = subItemsFor(link, services, industries);
                const isSubOpen = openSub === link.label;
                return (
                  <motion.div
                    key={link.label}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: EXPO,
                      delay: 0.12 + i * 0.06,
                    }}
                    className="border-b border-line"
                  >
                    {subs ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSub((v) =>
                              v === link.label ? null : link.label,
                            )
                          }
                          aria-expanded={isSubOpen}
                          className="flex w-full items-center justify-between py-6 text-left"
                        >
                          <span className="text-[28px] font-medium tracking-[-0.03em] text-ink">
                            {link.label}
                          </span>
                          <ChevronDown
                            size={20}
                            className={cn(
                              "text-ink-400 transition-transform duration-400 ease-expo",
                              isSubOpen && "rotate-180",
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isSubOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: EXPO }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-1 pb-5 pl-4">
                                {subs.map((child) => (
                                  <a
                                    key={child.label}
                                    href={child.href}
                                    onClick={() => setOpen(false)}
                                    className="py-3 text-[16px] font-medium leading-snug text-ink-500"
                                  >
                                    {child.label}
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.newTab ? "noopener noreferrer" : undefined}
                        onClick={() => setOpen(false)}
                        className="block py-6 text-[28px] font-medium tracking-[-0.03em] text-ink"
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EXPO, delay: 0.4 }}
                className="mt-8"
              >
                <Button
                  href="/#contact"
                  variant="ink"
                  size="lg"
                  arrow
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Start a Project
                </Button>

                <div className="mt-8 flex items-center gap-2">
                  {socials.map((s) => {
                    const Icon = socialIcon(s.icon);
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Funavry on ${s.label}`}
                        className="flex h-11 w-11 items-center justify-center border border-line text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
