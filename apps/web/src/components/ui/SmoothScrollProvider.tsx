"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerScroller } from "@/lib/scroll-lock";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* No hover while the page is moving. Scrolling carries content under a
     pointer that is standing still, so every card, slab and link it crosses
     fires its hover: the service stack lifted and dropped, slabs lit and
     dimmed, lines ran — a flicker that read as the scroll itself jerking, and
     a repaint on every one.

     While the page moves, an invisible full-screen shield takes the pointer,
     so nothing under it is hovered; it goes 150ms after the page is still,
     and hover resumes from wherever the pointer then rests. Wheel events on it
     bubble to the window, so Lenis keeps scrolling.

     A shield rather than `pointer-events: none` on the body: that is an
     inherited property, so toggling it restyled all ~2,400 elements on the
     page at every scroll start and stop, 20-60ms each — a jerk of its own.
     Showing and hiding one fixed element restyles only that element.

     Listens to native `scroll`, so it covers Lenis and the reduced-motion
     case alike. */
  useEffect(() => {
    const shield = document.createElement("div");
    shield.setAttribute("aria-hidden", "true");
    shield.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:none;";
    document.body.appendChild(shield);

    let idle = 0;
    const onScroll = () => {
      if (!idle) shield.style.display = "block";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        idle = 0;
        shield.style.display = "none";
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
      shield.remove();
    };
  }, []);

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
