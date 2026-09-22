import Image from "next/image";
import { TECH_ICONS } from "@/lib/tech-icons";
import { TECH_LOGOS } from "@/lib/tech-logos";
import { TECH_MARKS } from "@/lib/tech-marks";
import { cn } from "@/lib/utils";

/** Relative luminance of a brand hex, 0..1. */
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const PAPER = "#F5F6F4";
const CHARCOAL = "#2E3436";

/**
 * How big a mark should be drawn so it carries the same visual weight as every
 * other mark beside it.
 *
 * Fitting artwork into a square box — `h-8 w-8` plus `object-contain` — sizes it
 * by its longest side, which is not what the eye measures. The eye measures
 * *area*. Docker is square and fills the box; GitLab CI/CD is 4.6:1 and gets a
 * fifth of the ink at the same nominal size; MongoDB is 1:2.1 and gets a third.
 * They are all "32px" and they look nothing like the same size, which is exactly
 * the complaint.
 *
 * Equal area is the right target but a bad rule on its own: it drops a 4.6:1
 * wordmark to ~11px tall, and a logotype that short stops being readable. So the
 * exponent is softened to 0.4 — most of the way to equal-area, not all of it —
 * and the result is clamped at both ends. Extreme ratios stay legible, and the
 * spread across this set falls from ~4.6x to ~1.3x.
 *
 * Returns px, because this has to be exact: a Tailwind class can't do algebra.
 */
function optical(w: number, h: number, size: number) {
  const ratio = w / h;

  // Height that would equalise area is `size * ratio ** -0.5`. 0.4 keeps most of
  // the correction while leaving wide logotypes tall enough to read.
  let height = size * Math.pow(ratio, -0.4);

  // Floors and ceilings, in that order: nothing shrinks below 0.6 of nominal (it
  // would read as a mistake), nothing grows past 1.32 (a tall mark would tower
  // over its own row), and nothing runs wider than 2.2x nominal — past that a
  // logotype starts shoving the vendor's name out of its own chip.
  height = Math.min(Math.max(height, size * 0.6), size * 1.32);
  let width = height * ratio;
  const maxWidth = size * 2.2;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / ratio;
  }

  return {
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
  };
}

type TechIconProps = {
  /** Resolved against TECH_MARKS, then TECH_LOGOS, then TECH_ICONS, then a monogram. */
  name: string;
  /** Shown when the vendor has no artwork anywhere. */
  mono?: string;
  /** Applied to the <svg> or <img>. */
  className?: string;
  /** Applied to the monogram <span>. Falls back to className. */
  monoClassName?: string;
  /**
   * Nominal optical size in px — the side of the square a mark of this weight
   * would occupy. Every mark is then sized to match that *weight*, not to fit
   * that box. Don't also pass a height in `className`; this owns the geometry.
   */
  size?: number;
  /**
   * The stage the mark sits on. A brand hex is only recognisable while it is
   * legible: near-black marks vanish on ink and near-white ones vanish on paper,
   * so each stage flips the ones that would disappear into it and leaves every
   * other brand colour exactly as the vendor ships it.
   */
  onDark?: boolean;
};

export default function TechIcon({
  name,
  mono,
  className,
  monoClassName,
  onDark = false,
  size = 30,
}: TechIconProps) {
  const mark = TECH_MARKS[name];

  if (mark) {
    /* Artwork painted in currentColor takes the vendor's hex when we have one —
       otherwise it takes the stage's own ink. */
    const hex = TECH_ICONS[name]?.hex;
    const color = onDark
      ? hex && lum(hex) > 0.34
        ? hex
        : PAPER
      : hex && lum(hex) < 0.86
        ? hex
        : CHARCOAL;

    const box = optical(mark.w, mark.h, size);

    return (
      <svg
        viewBox={`0 0 ${mark.w} ${mark.h}`}
        role="img"
        aria-label={name}
        width={box.width}
        height={box.height}
        // A black-on-white lockup (Next.js, Express, OpenAI) is the one thing a
        // dark stage cannot show. Vendors publish a white variant for exactly
        // this; inverting gets there without shipping a second file.
        className={cn(className, onDark && mark.dark && "invert")}
        style={{
          ...(mark.mono ? { color } : undefined),
          width: box.width,
          height: box.height,
        }}
        dangerouslySetInnerHTML={{ __html: mark.body }}
      />
    );
  }

  const logo = TECH_LOGOS[name];

  if (logo) {
    // These are square canvases, so nominal size is already the optical size.
    return (
      <Image
        src={logo.src}
        alt={name}
        width={logo.width}
        height={logo.height}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }

  const icon = TECH_ICONS[name];

  if (!icon) {
    return (
      <span
        title={name}
        className={cn(
          "flex items-center justify-center rounded-md bg-ink/[0.05] font-mono font-semibold tracking-tight text-ink/55",
          monoClassName ?? className,
        )}
      >
        {mono ?? name.slice(0, 2)}
      </span>
    );
  }

  const fill = onDark
    ? lum(icon.hex) > 0.34
      ? icon.hex
      : PAPER
    : lum(icon.hex) < 0.86
      ? icon.hex
      : CHARCOAL;

  // Simple Icons are always a 24x24 square glyph, so nominal is optical.
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={name}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
      fill={fill}
    >
      <title>{name}</title>
      <path d={icon.path} />
    </svg>
  );
}
