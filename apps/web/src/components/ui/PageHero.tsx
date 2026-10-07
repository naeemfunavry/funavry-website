import Image from "next/image";
import Container from "@/components/ui/Container";
import HeroActions from "@/components/ui/HeroActions";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

/* Feathers a contained photo's left, top and bottom edges to transparent, so
   it dissolves into the ink instead of sitting on it as a hard rectangle. The
   right edge stays flush with the viewport. The two gradients are intersected,
   so a pixel shows only where both keep it. */
const CONTAIN_FEATHER =
  "linear-gradient(to right, transparent 0%, #000 34%), " +
  "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)";

/**
 * The dark page opener the industry, service and case study pages share: a
 * photograph filling the right and fading into the ink under the copy, an
 * amber eyebrow, the title, a line, the actions, and anything the page wants
 * under them.
 *
 * `id="top"` puts the nav in its on-dark style while it sits over this.
 */
export default function PageHero({
  image,
  eyebrow,
  title,
  body,
  actions,
  children,
  footer,
}: {
  /** `fit: "contain"` shows the whole photo instead of cropping it to fill —
      for a portrait or otherwise tall photo that cover would gut. It sits at
      the right and its edges feather into the ink, so it reads as part of the
      hero rather than a pasted rectangle; pass its pixel `width`/`height`. */
  image: {
    src: string;
    position?: string;
    fit?: "cover" | "contain";
    width?: number;
    height?: number;
  };
  eyebrow: string;
  /** One line per entry; each rises in after the one before. */
  title: string[];
  body: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Under the copy, wider than its column — room for a full stats row. */
  footer?: React.ReactNode;
}) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#102e54] pb-20 pt-[150px] lg:flex lg:min-h-[680px] lg:items-center lg:pb-24"
    >
      <div aria-hidden className="absolute inset-0 lg:left-[34%]">
        {image.fit === "contain" ? (
          <Image
            src={image.src}
            alt=""
            width={image.width ?? 1200}
            height={image.height ?? 1600}
            priority
            quality={88}
            sizes="(max-width: 1024px) 100vw, 45vw"
            /* Sized to the photo's own shape and pinned right, so its box is
               the photo (no letterbox) and the mask can feather its left,
               top and bottom edges straight into the ink. */
            className="ml-auto block h-full w-auto max-w-none object-contain"
            style={{
              objectPosition: image.position ?? "right",
              maskImage: CONTAIN_FEATHER,
              WebkitMaskImage: CONTAIN_FEATHER,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        ) : (
          <Image
            src={image.src}
            alt=""
            fill
            priority
            quality={88}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            style={{ objectPosition: image.position ?? "center" }}
          />
        )}
      </div>
      {/* Ink over the photograph: solid under the copy, clearing to the right.
          On a phone the photograph sits behind everything, dimmed evenly. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#102e54]/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,#102E54_0%,#102E54_34%,rgba(16,46,84,0.82)_46%,rgba(16,46,84,0.25)_72%,rgba(16,46,84,0.05)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />

      <Container wide className="relative z-10 w-full">
        <div className="max-w-[600px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-h2 text-paper">
            {title.map((line, i) => (
              <span key={line} className="block">
                <KineticWords text={line} delay={i * 0.12} trigger="mount" />
              </span>
            ))}
          </h1>
          <Wipe delay={0.2}>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.7] text-paper/70">
              {body}
            </p>
          </Wipe>
          {actions && (
            <HeroActions className="mt-9">{actions}</HeroActions>
          )}
          {children}
        </div>
        {footer && <div className="max-w-[860px]">{footer}</div>}
      </Container>
    </section>
  );
}

/** A row of figures under the hero's actions, as the case study hero has. */
export function HeroStats({ stats }: { stats: { value: string; label: string }[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-paper/15 pt-8 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col">
          <dt className="order-2 mt-2.5 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.16em] text-paper/55">
            {stat.label}
          </dt>
          <dd className="order-1 text-[clamp(24px,2.6vw,34px)] font-semibold leading-none tracking-[-0.03em] text-paper">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
