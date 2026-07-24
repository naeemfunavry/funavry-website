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
      const el = document.querySelector<HTMLElement>(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });

      /* Calling preventDefault takes over the browser's job here, and scrolling
         is only half of that job — following a fragment link also moves focus
         to the target. Without this, every in-page link on the site (the skip
         link, the nav's section links, the hero's "Explore Our Case Studies")
         moved the viewport while leaving focus back at the link, so the next
         Tab resumed from the header rather than from the content just scrolled
         to. That is a WCAG 2.4.3 focus-order failure, and for the skip link it
         defeats the point of having one.

         Section landmarks aren't focusable by default, so make the target
         programmatically focusable first. `preventScroll` matters: without it
         the browser jumps to the element instantly and fights the smooth scroll
         Lenis is running. */
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
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
