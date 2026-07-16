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

    return (
      <svg
        viewBox={`0 0 ${mark.w} ${mark.h}`}
        role="img"
        aria-label={name}
        // A black-on-white lockup (Next.js, Express, OpenAI) is the one thing a
        // dark stage cannot show. Vendors publish a white variant for exactly
        // this; inverting gets there without shipping a second file.
        className={cn(className, onDark && mark.dark && "invert")}
        style={mark.mono ? { color } : undefined}
        dangerouslySetInnerHTML={{ __html: mark.body }}
      />
    );
  }

  const logo = TECH_LOGOS[name];

  if (logo) {
    return (
      <Image
        src={logo.src}
        alt={name}
        width={logo.width}
        height={logo.height}
        className={className}
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

  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={name} className={className} fill={fill}>
      <title>{name}</title>
      <path d={icon.path} />
    </svg>
  );
}
