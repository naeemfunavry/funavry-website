"use client";

import { cn } from "@/lib/utils";

/**
 * A laptop, built rather than photographed.
 *
 * It is real 3D, not a drawing of 3D: the lid stands up, the base is hinged at
 * the lid's foot and rotated 76° back so it lies down, and both live under the
 * caller's `perspective`. That is the entire reason it holds together — the base
 * foreshortens because it is genuinely lying away from the camera, so it agrees
 * with the lid about where the viewer is at any turn the caller picks, and there
 * is no angle at which the illusion comes apart.
 *
 * It is stylised, and deliberately so. A photoreal MacBook is a render, and a
 * render is an asset; this is aluminium suggested with four gradients on a site
 * built from hairlines. It reads as the machine without pretending to be a
 * photograph of one.
 *
 * `children` is the screen. It is handed the lid's inner box, so anything
 * positioned against it — the capture, its callouts — is positioned against the
 * screen and travels with the turn.
 */
export default function Laptop({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* ---- Lid. The bezel is a hair lighter at the top, because the key light
              is up there and aluminium is not flat. ---- */}
      <div
        className="relative rounded-[10px] bg-gradient-to-b from-[#4A5254] to-[#2F3639] p-[5px] pb-0 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Not clipped: the screen's own contents round themselves, and the
            callouts that hang off it have to be able to leave the lid. */}
        <div className="relative rounded-[5px] bg-ink">{children}</div>

        {/* Chin. Real laptops have one, and leaving it off is the fastest way to
            make a lid read as a floating rectangle. */}
        <div className="flex h-[10px] items-center justify-center">
          <span
            aria-hidden
            className="h-[2px] w-[2px] rounded-full bg-white/20"
          />
        </div>
      </div>

      {/* ---- Base. Hinged at the lid's foot and laid back, so its depth is
              spent going away from the camera rather than down the page: 62% of
              the width in 3D collapses to roughly 15% on screen, which is why a
              laptop takes so little vertical room for how much of it there is.

              Slightly wider than the lid, as the real thing is — the lid nests
              into the base, not the other way round. ---- */}
      <div
        aria-hidden
        className="absolute left-[-1.5%] top-full h-0 w-[103%] origin-top pt-[62%]"
        style={{ transform: "rotateX(76deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-b-[9px] rounded-t-[3px] bg-gradient-to-b from-[#B9C0C2] via-[#D2D8D9] to-[#9BA3A6]">
          {/* Hinge shadow, where the lid meets the deck. */}
          <span className="absolute inset-x-0 top-0 h-[3%] bg-gradient-to-b from-[#5C6467] to-transparent" />

          {/* Keyboard well and trackpad, at the proportions they actually sit
              at. Suggested, not drawn: at this size individual keys would be
              sub-pixel mush, and a grey well reads as keys the moment the
              trackpad below it gives the eye the scale. */}
          <span className="absolute inset-x-[8%] top-[10%] h-[46%] rounded-[2px] bg-[#8E9699]/25 shadow-[0_1px_0_rgba(255,255,255,0.35)]" />
          <span className="absolute left-1/2 top-[62%] h-[30%] w-[34%] -translate-x-1/2 rounded-[2px] bg-[#8E9699]/18 shadow-[0_1px_0_rgba(255,255,255,0.4)]" />
        </div>
      </div>
    </div>
  );
}
