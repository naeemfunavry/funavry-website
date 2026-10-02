"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { KineticWords } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";
import type { ShowcaseView } from "@/lib/case-study-view";
import type { Shot } from "@/lib/work-model";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Product Showcase: the product on its devices, one view at a time — the
 * desktop application on a laptop with a phone beside it, the mobile
 * application, an analytics dashboard.
 *
 * One framed stage: a bar across its top with the views as tabs and the
 * count, the devices standing on a soft floor, and the screen's own caption
 * under them. The arrows beside the heading step through the views, drawn as
 * the site's other decks draw theirs.
 */
export default function ProductShowcase({
  views,
  lead,
}: {
  views: ShowcaseView[];
  lead?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  if (views.length === 0) return null;

  const view = views[index];
  const many = views.length > 1;
  const step = (by: number) =>
    setIndex((i) => (i + by + views.length) % views.length);
  const caption = (view.screen ?? view.phones[0])?.alt;

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-heading"
      className="relative scroll-mt-20 overflow-hidden border-b border-line bg-[linear-gradient(180deg,#F8FBFE_0%,#EEF5FC_100%)]"
    >
      {/* The Compliance & Governance band's ground: a faint grid under two
          azure glows, so the stage sits on light, clean blue. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 90% 8%, rgba(68,158,216,0.14), transparent 70%), radial-gradient(35% 50% at 86% 78%, rgba(68,158,216,0.16), transparent 70%)",
        }}
      />
      <Container wide className="relative py-8 sm:py-12 lg:py-14">
        {/* The head, in the home Industries section's form: eyebrow and the
            heading on the left, the lead on the right, and the deck arrows
            parked under it. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                The Product
              </span>
            </div>
            <h2 id="showcase-heading" className="mt-6 text-h3 text-ink">
              <KineticWords text="Product Showcase" />
            </h2>
          </div>

          {lead && (
            <p className="max-w-[52ch] text-[15px] leading-[1.7] text-ink-500">
              {lead}
            </p>
          )}
        </div>

        {many && (
          <div className="mt-6 hidden items-center justify-end lg:flex">
            <DeckButton dir="prev" onClick={() => step(-1)} />
            <DeckButton dir="next" onClick={() => step(1)} />
          </div>
        )}

        <div
          className={cn(
            "relative mt-10 overflow-hidden rounded-lg bg-paper-white ring-1 ring-line",
            many ? "lg:mt-4" : "lg:mt-12",
          )}
        >
          {/* The bar: views as tabs on the left, the count on the right. */}
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
            {many ? (
              <div
                role="tablist"
                aria-label="Product views"
                className="-my-1 flex min-w-0 gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {views.map((v, i) => {
                  const on = i === index;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-controls="showcase-stage"
                      onClick={() => setIndex(i)}
                      className={cn(
                        "relative h-9 flex-none rounded px-4 text-[13px] font-medium transition-colors duration-300",
                        on ? "text-paper" : "text-ink-500 hover:bg-paper-deep hover:text-ink",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="showcase-tab"
                          aria-hidden
                          className="absolute inset-0 rounded bg-azure-600"
                          transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                        />
                      )}
                      <span className="relative">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-[13px] font-medium text-ink">{view.label}</span>
            )}

            <span className="flex-none font-mono text-[10.5px] tracking-[0.2em] text-ink-400">
              <span className="text-ink">{String(index + 1).padStart(2, "0")}</span>
              {" / "}
              {String(views.length).padStart(2, "0")}
            </span>
          </div>

          {/* The stage. */}
          <div
            id="showcase-stage"
            role={many ? "tabpanel" : undefined}
            aria-label={view.label}
            className="relative bg-gradient-to-b from-paper-white via-azure-50/50 to-azure-100/60 px-6 pb-8 pt-10 sm:px-12 lg:px-20 lg:pt-12"
          >
            <div aria-hidden className="absolute inset-0 grid-paper opacity-30" />
            {/* The floor the devices stand on. */}
            <div
              aria-hidden
              className="absolute inset-x-[15%] bottom-[18%] h-10 rounded-[50%] bg-azure/20 blur-2xl"
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={view.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative"
              >
                <Devices view={view} />
                {caption && (
                  <figcaption className="mt-8 flex items-center justify-center gap-3 text-center text-[13.5px] text-ink-500">
                    <span aria-hidden className="h-px w-6 flex-none bg-azure" />
                    {caption}
                    <span aria-hidden className="h-px w-6 flex-none bg-azure" />
                  </figcaption>
                )}
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>

        {/* The arrows, under the stage on a phone. */}
        {many && (
          <div className="mt-6 flex justify-center lg:hidden">
            <DeckButton dir="prev" onClick={() => step(-1)} />
            <DeckButton dir="next" onClick={() => step(1)} />
          </div>
        )}
      </Container>
    </section>
  );
}

/** The view's devices: a laptop with a phone overlapping its right edge, a
    laptop alone, or up to three phones side by side. */
function Devices({ view }: { view: ShowcaseView }) {
  if (!view.screen) {
    return (
      <div className="mx-auto flex max-w-[520px] items-end justify-center gap-4 sm:gap-6">
        {view.phones.map((phone, i) => (
          <Phone
            key={phone.src}
            shot={phone}
            className={cn("w-[30%] max-w-[160px]", i === 1 && "sm:-translate-y-4")}
          />
        ))}
      </div>
    );
  }

  const phone = view.phones[0];
  return (
    <div className="relative mx-auto max-w-[760px]">
      <div className={cn(phone ? "mr-[18%]" : "mx-auto max-w-[640px]")}>
        <Laptop shot={view.screen} />
      </div>
      {phone && (
        <Phone
          shot={phone}
          className="absolute bottom-0 right-0 w-[24%] max-w-[180px]"
        />
      )}
    </div>
  );
}

function Laptop({ shot }: { shot: Shot }) {
  return (
    <div>
      <div className="rounded-t-[14px] bg-ink-900 p-[1.4%] pb-[2%] shadow-[0_40px_80px_-40px_rgba(15,23,42,0.55)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[3px] bg-paper-white">
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="(max-width: 1024px) 80vw, 600px"
            className="object-cover object-left-top"
          />
        </div>
      </div>
      <div className="relative -mx-[5%] h-3 rounded-b-[12px] bg-gradient-to-b from-line-strong to-ink-400 shadow-[0_18px_30px_-12px_rgba(15,23,42,0.45)] sm:h-4">
        <span className="absolute left-1/2 top-0 h-1 w-[14%] -translate-x-1/2 rounded-b-md bg-ink-400/70" />
      </div>
    </div>
  );
}

function Phone({ shot, className }: { shot: Shot; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[22px] bg-ink-900 p-[3.5%] shadow-[0_30px_60px_-25px_rgba(15,23,42,0.6)]",
        className,
      )}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[16px] bg-paper-white">
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="200px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

/** The site's deck control: two square buttons sharing a border. */
function DeckButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous view" : "Next view"}
      aria-controls="showcase-stage"
      className={cn(
        "flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper",
        dir === "next" && "-ml-px",
      )}
    >
      <Icon size={16} aria-hidden />
    </button>
  );
}
