"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { type Service } from "@/lib/services";
import { HOUSE_LABEL, PHASE, SERVICE_ICONS } from "@/lib/service-style";
import { cn } from "@/lib/utils";

export { HOUSE_LABEL, PHASE, SERVICE_ICONS };

/**
 * The sub-services drawer — a bottom sheet on phones, a centred dialog from
 * `sm` up. Lifted out of `Capabilities` so the capability index and the card
 * grid open the same panel instead of each carrying a copy.
 *
 * Two things changed in the lift. It now locks through `@/lib/scroll-lock`
 * rather than setting `body.overflow` itself: this site scrolls through Lenis,
 * which keeps gliding a hidden-overflow page, so the old lock left the page
 * drifting behind the open sheet. And the scroll region carries
 * `data-lenis-prevent`, without which a stopped Lenis swallows the wheel events
 * inside the panel and the sheet's own overflow won't scroll.
 */

const EXPO = [0.19, 1, 0.22, 1] as const;

export default function ServiceDrawer({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const Icon = SERVICE_ICONS[service.icon];
  const phase = PHASE[service.phase];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lockScroll();
    // Opening a dialog without moving focus into it leaves a keyboard user
    // still on the page behind, tabbing through content they can't see.
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={service.title}
        data-lenis-prevent
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.5, ease: EXPO }}
        className="relative max-h-[88vh] w-full max-w-[840px] overflow-y-auto border border-line bg-paper-white sm:mx-6"
      >
        {/* Phase seam. */}
        <div
          aria-hidden
          className={cn("absolute inset-x-0 top-0 h-[3px]", phase.dot)}
        />

        <div className="flex items-start justify-between gap-6 border-b border-line p-7 pt-8 lg:p-10">
          <div className="flex items-start gap-5">
            <span className="flex h-12 w-12 flex-none items-center justify-center border border-line">
              <Icon size={22} strokeWidth={1.5} className="text-ink" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                  {service.n}
                </span>
                <span aria-hidden className="h-px w-4 bg-line-strong" />
                <span
                  className={cn(
                    "font-mono text-[9.5px] uppercase tracking-[0.16em]",
                    phase.text,
                  )}
                >
                  {service.phase}
                </span>
              </div>
              <h3 className="mt-3 max-w-[24ch] text-[22px] font-medium leading-snug tracking-[-0.025em] text-ink lg:text-[28px]">
                {service.title}
              </h3>
            </div>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-none items-center justify-center border border-line text-ink-500 transition-colors hover:bg-ink hover:text-paper"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-7 lg:p-10">
          <p className="max-w-[64ch] text-[15.5px] leading-[1.75] text-ink-500">
            {service.summary}
          </p>

          <div className="mt-9 grid gap-px bg-line sm:grid-cols-2">
            {service.subs.map((sub, i) => (
              <motion.div
                key={sub.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.12 + i * 0.06,
                  duration: 0.5,
                  ease: EXPO,
                }}
                className="bg-paper-white p-5 lg:p-6"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-ink-400">
                    {service.n}.{i + 1}
                  </span>
                  <h4 className="text-[15px] font-medium leading-snug text-ink">
                    {sub.title}
                  </h4>
                </div>
                <p className="mt-2 pl-[30px] text-[13px] leading-[1.65] text-ink-400">
                  {sub.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button
              href="#contact"
              variant="ink"
              size="md"
              arrow
              onClick={onClose}
            >
              Discuss this service
            </Button>
            <Button
              href={`/services/${service.slug}`}
              variant="secondary"
              size="md"
            >
              View practice
            </Button>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-400">
              {HOUSE_LABEL[service.group]}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
