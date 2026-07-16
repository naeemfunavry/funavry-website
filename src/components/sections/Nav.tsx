"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { SERVICES, type Service } from "@/lib/services";
import { INDUSTRIES } from "@/lib/industries";
import { SOCIALS } from "@/lib/socials";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;

type Link = {
  label: string;
  href: string;
  /** A full-width mega panel keyed by content. */
  mega?: "services" | "industries";
  /** A small self-contained dropdown. */
  children?: { label: string; href: string; desc: string }[];
};

/* Rooted at "/", not bare fragments: the bar also flies over /case-studies, and
   "#work" from there scrolls to nothing. On the home page a same-document
   fragment still resolves as a jump, so nothing changes there. */
const LINKS: Link[] = [
  { label: "Services", href: "/#capabilities", mega: "services" },
  { label: "Industries", href: "/#industries", mega: "industries" },
  { label: "Work", href: "/#work" },
  { label: "Case Studies", href: "/case-studies" },
  {
    label: "Company",
    href: "/#insights",
    children: [
      {
        label: "Careers",
        href: "/#careers",
        desc: "Build with a team of 200+",
      },
      { label: "Blog", href: "/#insights", desc: "Engineering & AI writing" },
      { label: "News", href: "/#insights", desc: "Announcements and press" },
    ],
  },
];

/** Flat sub-item list for the mobile accordion, derived from either a mega or a
    small dropdown. */
function subItemsFor(link: Link): { label: string; href: string }[] | null {
  if (link.children)
    return link.children.map((c) => ({ label: c.label, href: c.href }));
  if (link.mega === "services")
    return SERVICES.map((s) => ({ label: s.title, href: "/#capabilities" }));
  if (link.mega === "industries")
    return INDUSTRIES.map((i) => ({ label: i.name, href: "/#industries" }));
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Mega panels                                                               */
/* -------------------------------------------------------------------------- */

const PAD = "px-5 sm:px-6 md:px-10 lg:px-14";

function MegaGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: Service[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="border-b border-line pb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </p>
      <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.n}>
            <a
              href="/#capabilities"
              onClick={onNavigate}
              className="group flex items-start gap-2.5 py-1.5"
            >
              <span
                aria-hidden
                className="mt-[7px] h-1 w-1 flex-none rounded-full bg-line-strong transition-colors group-hover:bg-azure"
              />
              <span className="text-[13px] leading-snug text-ink-500 transition-colors group-hover:text-ink">
                {s.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicesMega({ onNavigate }: { onNavigate: () => void }) {
  const tech = SERVICES.filter((s) => s.group === "tech");
  const gbs = SERVICES.filter((s) => s.group === "gbs");
  return (
    <div className={cn("mx-auto w-full max-w-wide py-10", PAD)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Services
          </p>
          <h3 className="mt-3 text-[21px] font-medium leading-snug tracking-[-0.02em] text-ink">
            Sixteen practices, one delivery model.
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-400">
            Build → Automate → Operate, across technology engineering and global
            business services.
          </p>
          <a
            href="/#capabilities"
            onClick={onNavigate}
            className="group mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-azure-ink"
          >
            Explore all capabilities
            <span className="transition-transform duration-300 ease-expo group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <MegaGroup
            label="Technology & Engineering"
            items={tech}
            onNavigate={onNavigate}
          />
          <MegaGroup
            label="Global Business Services"
            items={gbs}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

function IndustriesMega({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className={cn("mx-auto w-full max-w-wide py-10", PAD)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Industries
          </p>
          <h3 className="mt-3 text-[21px] font-medium leading-snug tracking-[-0.02em] text-ink">
            Ten industries, deep domain fluency.
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-400">
            Five hundred delivered projects across the sectors we know cold.
          </p>
          <a
            href="/#industries"
            onClick={onNavigate}
            className="group mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-azure-ink"
          >
            Explore all industries
            <span className="transition-transform duration-300 ease-expo group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          {INDUSTRIES.map((ind) => (
            <li key={ind.name}>
              <a
                href="/#industries"
                onClick={onNavigate}
                className="group block"
              >
                <span className="flex items-center gap-2 text-[14px] font-medium tracking-[-0.01em] text-ink">
                  <span
                    aria-hidden
                    className="h-px w-0 flex-none bg-azure transition-all duration-400 ease-expo group-hover:w-3"
                  />
                  {ind.name}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-ink-400">
                  {ind.desc}
                </span>
              </a>
            </li>
          ))}
        </ul>
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

export default function Nav() {
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setMega(null);
    };
    onScroll();
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
            {SOCIALS.map((s) => {
              const Icon = s.icon;
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
            className="absolute inset-x-0 top-full hidden border-y border-line bg-paper-white/95 shadow-[0_30px_60px_-30px_rgba(46,52,54,0.3)] backdrop-blur-xl lg:block"
          >
            {mega === "services" ? (
              <ServicesMega onNavigate={() => setMega(null)} />
            ) : (
              <IndustriesMega onNavigate={() => setMega(null)} />
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
                const subs = subItemsFor(link);
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
                                    className="py-2.5 text-[16px] font-medium leading-snug text-ink-500"
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
                  {SOCIALS.map((s) => {
                    const Icon = s.icon;
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
