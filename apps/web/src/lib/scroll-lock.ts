/**
 * Scroll locking for overlays (drawers, modals, the mobile menu).
 *
 * `document.body.style.overflow = "hidden"` is not enough on this site: Lenis
 * drives the scroll itself and will keep gliding a hidden-overflow page. The
 * instance has to be stopped too, so SmoothScrollProvider registers it here and
 * overlays lock through `lockScroll` / `unlockScroll`.
 *
 * Stopping Lenis freezes wheel and touch; the overflow lock covers what Lenis
 * doesn't — keyboard paging and scrollbar drags — and also handles the
 * reduced-motion case, where no Lenis instance exists at all.
 *
 * A scrollable region *inside* an overlay must carry `data-lenis-prevent`, or
 * Lenis swallows its wheel events while stopped.
 */

type Scroller = { stop: () => void; start: () => void };

let scroller: Scroller | null = null;
/** Nested overlays must not unlock each other; the last one out restores. */
let locks = 0;
let restore = "";

export function registerScroller(instance: Scroller | null) {
  scroller = instance;
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;

  const root = document.documentElement;
  restore = root.style.overflow;
  // `scrollbar-gutter: stable` (globals.css) holds the gutter open, so hiding
  // the scrollbar here doesn't shift the page under the overlay.
  root.style.overflow = "hidden";
  scroller?.stop();
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;

  document.documentElement.style.overflow = restore;
  scroller?.start();
}
