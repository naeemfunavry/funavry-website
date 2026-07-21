"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerScroller } from "@/lib/scroll-lock";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.08, duration: 1.4 });
    // Overlays need to be able to stop it — body overflow alone won't.
    registerScroller(lenis);

    /* Driven by a plain rAF. This used to run on `gsap.ticker`, with
       ScrollTrigger registered alongside it — but nothing on the site ever
       created a ScrollTrigger, so the whole of GSAP was being shipped and
       parsed to do what one `requestAnimationFrame` does. `gsap.ticker` hands
       out seconds and rAF hands out milliseconds, which is the only reason
       the old line multiplied by 1000. */
    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      registerScroller(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
