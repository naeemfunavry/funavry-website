"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProductWindow from "@/components/ui/ProductWindow";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { CASE_PHASE, CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/* Selected Work, as a browser rather than a deck.
 *
 * A tab per study picks what is on the stage; the stage itself tilts under the
 * pointer, with the capture window and a phone sitting at different depths so
 * the parallax between them reads as one object turning. The deck advances on
 * its own while it's on screen, sliding each study on from the side it's
 * travelling. Clicking the stage opens the full study.
 *
 * This is a third presentation of the same six studies, alongside `Work`
 * (framed deck) and `WorkShowcase` (Stripe-style reveal) — one of them goes in
 * the running order in app/page.tsx, not all three. See the note at the foot.
 *
 * The metrics row is `highlights` from the corporate deck, shown only for the
 * studies that have them. It is not padded out for the two that don't: the
 * numbers on this page are approved facts or they are absent. */

const STUDIES = CASE_STUDIES;

const EXPO = [0.19, 1, 0.22, 1] as const;

/* The stage field, in the study's own phase hue: a diagonal wash lit from the
   opposite corner by the warm amber glow, the same construction the Work
   showcase uses so the two read as one system. */
function stageField(tint: string) {
  return [
    `radial-gradient(120% 120% at 88% 92%, rgba(245,159,19,0.16), transparent 58%)`,
    `linear-gradient(150deg, rgba(${tint},0.05) 0%, rgba(${tint},0.14) 40%, rgba(${tint},0.26) 100%)`,
    `linear-gradient(#FFFFFF, #FFFFFF)`,
  ].join(",");
}

/* The phone. A charcoal bezel with a speaker slot, holding the study's own
   mobile capture.
 *
 * Only rendered for a study that HAS one — `mobileImage` is optional, and the
 * four desktop-only studies get no phone rather than a stand-in. A device on
 * the page is a claim about what was built, and now that two of these products
 * genuinely shipped a mobile surface, a phone on the other four would be
 * claiming a fifth and sixth that don't exist.
 *
 * The screen is a real screenshot of a different interface, not a second view
 * of the window beside it, so it carries its own alt text rather than being
 * hidden as decoration.
 *
 * The screen has no aspect ratio of its own — the capture gives it one, so the
 * whole screenshot is on screen and the bezel takes whatever height that comes
 * to. The two captures are not the same shape (0.479 and 0.436), so the phone
 * is a slightly different height per study; it is anchored by its bottom edge,
 * which puts that difference somewhere nobody is looking. */
function PhoneFrame({
  image,
  title,
}: {
  image: StaticImageData;
  title: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border-[5px] border-ink-900 bg-ink-900 shadow-[0_30px_60px_-18px_rgba(46,52,54,0.5),0_2px_6px_rgba(46,52,54,0.12)]">
      {/* Speaker slot, over the screen rather than above it — the bezel is thin
          enough that a reserved strip would eat the capture's own status bar. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-[7px] z-10 h-[3px] w-9 -translate-x-1/2 rounded-full bg-paper/25"
      />

      <div className="relative overflow-hidden rounded-[19px] bg-paper-deep">
        <Image
          src={image}
          alt={`${title} — mobile interface`}
          quality={90}
          placeholder="blur"
          sizes="180px"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

/* One highlight from the deck — the headline figure over its context line. */
function Metric({ value, detail }: { value: string; detail: string }) {
  return (
    <div>
      <div className="text-[22px] font-medium leading-[1.1] tracking-[-0.025em] text-ink lg:text-[26px]">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-500">
        {detail}
      </div>
    </div>
  );
}

/* The full study, over the page. Escape closes, the page behind is locked, and
   the panel carries `data-lenis-prevent` so a stopped Lenis stops swallowing
   its wheel events. */
function StudyDialog({
  study,
  onClose,
}: {
  study: CaseStudy;
  onClose: () => void;
}) {
  const phase = CASE_PHASE[study.phase];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lockScroll();
    // Focus lands on the one control that gets you back out, so the dialog is
    // dismissible from the keyboard the moment it opens.
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <button
        type="button"
        aria-label="Close case study"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={study.title}
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.42, ease: EXPO }}
        /* Wider than the copy needs, because this is where the capture is meant
           to actually be read — the stage can only ever be a thumbnail of a
           dashboard, and this is the view that isn't. */
        className="relative max-h-[88vh] w-full max-w-[1140px] overflow-y-auto overscroll-contain rounded-[8px] bg-paper-white shadow-[0_50px_100px_-40px_rgba(46,52,54,0.55)]"
      >
        <span aria-hidden className={cn("block h-[3px] w-full", phase.dot)} />

        <div className="p-6 sm:p-10 lg:p-12">
          <header className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 flex-none rounded-full",
                    phase.dot,
                  )}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {study.sector}
                </span>
                <span aria-hidden className="h-px w-3 bg-line-strong" />
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em]",
                    phase.text,
                  )}
                >
                  {study.phase}
                </span>
              </div>
              <h3 className="mt-3 text-h3 text-ink">{study.title}</h3>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-sm border border-line text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              <X size={15} />
            </button>
          </header>

          {/* Same pairing as the stage, and for the same reason: a study whose
              mobile surface is on the deck should not lose it on the way into
              the full write-up. */}
          <div className="relative mt-8">
            <div className={study.mobileImage ? "w-[93%]" : "w-full"}>
              <ProductWindow
                study={study}
                fit="full"
                sizes="(max-width: 1024px) 92vw, 1020px"
              />
            </div>
            {study.mobileImage && (
              <div className="absolute -bottom-3 right-0 w-[16%] max-w-[112px] rotate-[3deg] sm:-bottom-5">
                <PhoneFrame image={study.mobileImage} title={study.title} />
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                What we built
              </div>
              <p className="mt-4 text-[15px] leading-[1.75] text-ink-500">
                {study.summary}
              </p>

              <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Capabilities
              </div>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {study.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-[7px] h-1 w-1 flex-none rounded-full",
                        phase.dot,
                      )}
                    />
                    <span className="text-[14px] leading-[1.6] text-ink">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {(study.client || study.team) && (
                <>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    Engagement
                  </div>
                  <dl className="mt-4 space-y-3">
                    {study.team && (
                      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                          Team
                        </dt>
                        <dd className="text-[14px] font-medium text-ink">
                          {study.team}
                        </dd>
                      </div>
                    )}
                    {study.client && (
                      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                          Delivered to
                        </dt>
                        <dd className="text-[14px] font-medium text-ink">
                          {study.client}
                        </dd>
                      </div>
                    )}
                  </dl>
                </>
              )}

              {study.highlights && (
                <>
                  <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    Highlights
                  </div>
                  <div className="mt-4 space-y-3">
                    {study.highlights.map((h) => (
                      <div
                        key={h.value}
                        className="flex items-baseline justify-between gap-4 border-t border-line pt-3"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                          {h.detail}
                        </span>
                        <span className="text-[15px] font-medium tracking-[-0.02em] text-ink">
                          {h.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Button
                href="/case-studies"
                variant="secondary"
                size="md"
                arrow
                className="mt-8 w-full"
              >
                All Case Studies
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WorkInteractive() {
  const reduce = useReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>();
  const [index, setIndex] = useState(0);
  /* Which way the deck last moved, so the outgoing slide leaves by the edge the
     incoming one is arriving from. Held alongside the index rather than derived
     from it: a wrap from the last study to the first is a step forward, and any
     comparison of the two indices reads it as five steps back. */
  const [direction, setDirection] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  const study = STUDIES[index];
  const phase = CASE_PHASE[study.phase];

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + STUDIES.length) % STUDIES.length);
  }, []);

  /* A tab or a dot travels the short way round to what it picked. */
  const select = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  /* Autoplay, on screen only. `paused` is a ref so a hover doesn't restart the
     interval it's suspending; `index` in the deps does restart it, which is
     what gives a manually picked study a full turn on screen instead of the
     remainder of someone else's. Off entirely under reduced motion, and while
     the dialog is up — nothing should be moving behind a modal. */
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();
  const pause = () => {
    clearTimeout(resumeTimer.current);
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };
  const resumeSoon = () => {
    resumeTimer.current = setTimeout(() => (paused.current = false), 900);
  };

  useEffect(() => {
    if (reduce || !inView || open) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, 6200);
    return () => clearInterval(id);
  }, [reduce, inView, open, index, go]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  /* The slide. Reduced motion keeps the crossfade and drops the travel. */
  const travel = reduce ? 0 : 52;
  const slide = {
    enter: (d: number) => ({ x: d > 0 ? travel : -travel, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -travel : travel, opacity: 0 }),
  };

  /* Pointer position across the stage, mapped to a shallow two-axis rotation.
     Vertical travel tips the stage away from the pointer (hence the negative),
     horizontal turns it toward — the pairing that reads as a solid being
     angled rather than a plane being skewed. Reduced motion opts out entirely:
     the stage stays flat and the frames keep their resting offsets. */
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  };

  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHover(false);
  };

  const close = useCallback(() => setOpen(false), []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative overflow-hidden bg-paper py-14 lg:py-24"
    >
      {/* Field: the azure lift the design puts in the top-right corner, plus the
          engineering grid every other section stands on. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 88% 0%, rgba(68,158,216,0.10), transparent 62%), radial-gradient(60% 50% at 8% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />

      <Container wide className="relative">
        {/* Header — tag and heading left, intro right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Selected Work
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="Systems we've" />
              <br />
              <KineticWords text="put into service." delay={0.12} />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-base leading-[1.75] text-ink-500">
              Web and enterprise platforms built end-to-end. Pick one below —
              open it for the full case study.
            </p>
          </Wipe>
        </div>

        {/* Tabs. Plain buttons rather than an ARIA tablist: the stage below is a
            single live region that swaps content, and `aria-pressed` describes
            that honestly without promising roving-focus tab semantics. */}
        <div className="mt-10 flex flex-wrap gap-2 lg:mt-14">
          {STUDIES.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => select(i)}
                aria-pressed={active}
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-sm border px-4 py-2.5 text-left text-[13.5px] font-medium tracking-[-0.01em] transition-colors duration-300 ease-standard",
                  active
                    ? "border-azure bg-azure-50 text-ink"
                    : "border-line-strong bg-transparent text-ink-500 hover:border-ink hover:bg-paper-white hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.12em]",
                    active ? "text-azure-ink" : "text-ink-400",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.sector}
              </button>
            );
          })}
        </div>

        {/* Stage. The tilt lives on the inner shell so the field, the shadow and
            the click target stay square to the page while the frames turn.
            Hover and touch hold the deck where it is — a study should never be
            pulled out from under someone who has just leaned into it. */}
        <div
          onMouseEnter={() => {
            setHover(true);
            pause();
          }}
          onMouseMove={onMove}
          onMouseLeave={() => {
            onLeave();
            resume();
          }}
          onTouchStart={pause}
          onTouchEnd={resumeSoon}
          /* Deliberately NOT `group/frame`. ProductWindow's hover state scales
             the window 1.02 and its capture a further 1.025, and a composited
             layer scaled by 4-odd percent is resampled — on a dashboard capture
             that lands squarely on the 10px table text the screenshot exists to
             show. The stage already signals it's interactive through the tilt
             and the pill; it does not need to do it by softening the thing
             being read. */
          className="relative mt-8 overflow-hidden rounded-[8px] border border-line transition-shadow duration-500 ease-standard lg:mt-10"
          style={{
            perspective: "1400px",
            boxShadow: hover
              ? "0 40px 80px -30px rgba(46,52,54,0.35)"
              : "0 20px 50px -30px rgba(46,52,54,0.28)",
          }}
        >
          {/* Field, crossfaded on phase change so the wash follows the study. */}
          <AnimatePresence>
            <motion.div
              key={study.phase}
              aria-hidden
              className="absolute inset-0"
              style={{ background: stageField(phase.tint) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </AnimatePresence>

          <motion.div
            className="relative"
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={
              hover
                ? { duration: 0.06, ease: "linear" }
                : { duration: 0.5, ease: EXPO }
            }
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* The slide. `mode="wait"` rather than two slides crossing: they
                would have to be taken out of flow to overlap, and an absolutely
                positioned stage can't size itself to whichever study is longest.
                `initial={false}` so the first study is simply there on load
                instead of arriving from off-stage.

                `preserve-3d` has to run every step from the rotating shell down
                to the frames — one flat ancestor collapses the whole chain and
                the phone loses its depth separation from the window. */}
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={study.slug}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0.25 : 0.45, ease: EXPO }}
                /* 1.35/0.65 rather than the comp's near-even split. The capture
                   is a whole dashboard shrunk into a thumbnail, so every pixel
                   of column width is legibility; the detail column beside it is
                   a heading, three lines, four chips and three figures, and it
                   reads fine narrow. */
                className="grid gap-10 p-6 [transform-style:preserve-3d] sm:p-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-center lg:gap-12 lg:p-12"
              >
                {/* Frames. Where there's a phone it hangs off the capture's
                  lower-right corner and sits further forward, so the parallax
                  between them is what carries the depth; where there isn't, the
                  window takes back the width it was holding open for it. */}
                {/* Both frames rest at transform NONE, and that is the whole fix
                  for the soft capture.

                  They used to sit at `rotate: -1.2deg, z: 20` permanently. Both
                  halves of that cost resolution: any non-zero rotation makes the
                  browser resample the rasterised layer through a bilinear
                  filter, and `translateZ(20px)` under `perspective: 1400px` is a
                  1.45% upscale of that same layer. Neither is visible on a
                  photograph and both are ruinous on a screenshot of an
                  interface, which is nothing but thin high-contrast edges.

                  So the depth is now something the stage DOES rather than
                  something it wears: square and pixel-exact at rest, and the two
                  frames only separate in z — and only pick up rotation — while
                  the pointer is actually tilting them. Resampling during a
                  motion nobody is reading through is free. */}
                {/* Each capture now sets its own window height, and the six of
                    them disagree — 16:10 through to CNBC's 2.02:1, a spread of
                    ~135px at this width. Left to itself the stage would resize
                    under every slide. So the column is pinned to the tallest and
                    the window is centred in it: the stage holds still, and a
                    wide capture simply sits with more air above and below.

                    The frames keep their own positioning context INSIDE that
                    box, so the phone still hangs off the window's bottom edge
                    rather than off the fixed column, which would strand it in
                    open space under a short capture. */}
                <div className="lg:flex lg:h-[560px] lg:items-center">
                  <div className="relative w-full [transform-style:preserve-3d]">
                    {/* `z` rather than an inline translateZ: Framer writes the
                      whole transform itself, so a hand-written one is
                      overwritten on the first animated frame. */}
                    <motion.div
                      animate={{
                        rotate: hover ? tilt.y * 0.15 : 0,
                        z: hover ? 20 : 0,
                      }}
                      transition={{ duration: 0.3, ease: EXPO }}
                      className={study.mobileImage ? "w-[93%]" : "w-full"}
                    >
                      <ProductWindow
                        study={study}
                        fit="full"
                        sizes="(max-width: 1024px) 88vw, 830px"
                      />
                    </motion.div>

                    {study.mobileImage && (
                      <motion.div
                        animate={{
                          rotate: hover ? tilt.y * 0.28 : 0,
                          z: hover ? 55 : 0,
                        }}
                        transition={{ duration: 0.3, ease: EXPO }}
                        className="absolute -bottom-4 right-0 w-[26%] max-w-[152px] sm:-bottom-6 sm:right-2"
                      >
                        <PhoneFrame
                          image={study.mobileImage}
                          title={study.title}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Detail column. */}
                <div className="mt-8 lg:mt-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 flex-none rounded-full",
                        phase.dot,
                      )}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      {study.sector}
                    </span>
                    <span aria-hidden className="h-px w-3 bg-line-strong" />
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.18em]",
                        phase.text,
                      )}
                    >
                      {study.phase}
                    </span>
                  </div>

                  <h3 className="mt-4 text-h3 text-ink">{study.title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.7] text-ink-500">
                    {study.summary}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {study.capabilities.map((c) => (
                      <span
                        key={c}
                        className="rounded-sm border border-line bg-paper-white/80 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-500 backdrop-blur-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Deck highlights, for the studies that carry them. Nothing
                    stands in for the ones that don't. */}
                  {study.highlights && (
                    <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                      {study.highlights.map((h) => (
                        <Metric key={h.value} {...h} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* The whole stage opens the study. A real button rather than a click
              handler on the shell: it lands in the tab order, announces itself,
              and its mousemove still bubbles to the tilt handler above. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-10 flex items-end justify-end p-5 lg:p-7"
          >
            <span className="sr-only">Open the {study.title} case study</span>
            <span
              aria-hidden
              className={cn(
                "inline-flex items-center gap-2 rounded-sm bg-ink/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper backdrop-blur-sm transition-opacity duration-300 ease-standard",
                hover ? "opacity-100" : "opacity-0",
              )}
            >
              View case study
              <ArrowRight size={13} />
            </span>
          </button>
        </div>

        {/* Pager. */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {STUDIES.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => select(i)}
              aria-label={`Show case study ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/20 hover:bg-ink/40",
              )}
            />
          ))}
        </div>

        <p aria-live="polite" className="sr-only">
          Case study {index + 1} of {STUDIES.length}: {study.title}
        </p>
      </Container>

      <AnimatePresence>
        {open && <StudyDialog study={study} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}

/* ── Notes ────────────────────────────────────────────────────────────────────
   Ported from an interactive-portfolio comp: project tabs, a pointer-tilted
   stage with layered frames, a metrics row, a dot pager, and a case-study
   modal. The interaction model is the comp's; the palette is this site's, and
   so is the content.

   What changed on the way in, and why:

   - The comp shipped five invented projects with invented figures ("38% cloud
     cost cut"). This runs CASE_STUDIES, and the only numbers on it are the deck
     `highlights` — the same exception @/lib/case-studies documents for the Work
     showcase, and the same reason: approved facts, not figures written for a
     layout.

   - The comp's clickable <div> stage is a real <button>, the modal takes
     Escape and locks Lenis through @/lib/scroll-lock, and the tilt, the
     autoplay and the slide's travel are all off under prefers-reduced-motion.

   The phone carries a real mobile capture, from `mobileImage` on the study, and
   appears only for the studies that have one — QFS and CNBC Arabia today. The
   other four are desktop-only engagements and show the window alone at full
   width. Adding a phone to those would mean either cropping their desktop
   capture into a portrait frame or drawing a mobile UI that was never built,
   and both are the same claim: a mobile product that doesn't exist. Drop a
   portrait capture in /public/case-studies/optimized and add one `mobileImage`
   line to light the phone up for another study.

   Not wired into app/page.tsx: an import Next can see is an import Next
   bundles, so this stays out of the running order until it replaces
   `<WorkShowcase />` there. Both carry id="work" — only one can be live. */
