"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True while the element is on screen.
 *
 * Exists for the animations that never stop on their own: the two autoplaying
 * decks and the core's idle drift. `document.hidden` only covers a
 * backgrounded tab, so before this every one of them kept running while the
 * reader was six sections away — timers firing, `scrollTo` churning layout,
 * React re-rendering slides nobody could see, and the compositor holding
 * layers alive for it. An observer costs one callback per crossing and lets
 * all of that go quiet.
 *
 * `rootMargin` starts things slightly before they arrive, so a deck is already
 * moving by the time it's actually looked at rather than visibly kicking off.
 */
export function useInView<T extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without IntersectionObserver, assume visible — never withhold motion
    // because the capability check failed.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}
