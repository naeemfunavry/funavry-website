import Image from "next/image";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

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
}: {
  image: { src: string; position?: string };
  eyebrow: string;
  /** One line per entry; each rises in after the one before. */
  title: string[];
  body: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink-900 pb-20 pt-[150px] lg:flex lg:min-h-[680px] lg:items-center lg:pb-24"
    >
      <div aria-hidden className="absolute inset-0 lg:left-[34%]">
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
      </div>
      {/* Ink over the photograph: solid under the copy, clearing to the right.
          On a phone the photograph sits behind everything, dimmed evenly. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-900/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,#21262A_0%,#21262A_34%,rgba(33,38,42,0.82)_46%,rgba(33,38,42,0.25)_72%,rgba(33,38,42,0.05)_100%)]"
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
            <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>
          )}
          {children}
        </div>
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
          <dt className="order-2 mt-2.5 font-mono text-[9.5px] uppercase leading-[1.5] tracking-[0.16em] text-paper/55 sm:text-[10px]">
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
