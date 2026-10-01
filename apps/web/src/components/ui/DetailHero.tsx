import Image from "next/image";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

/**
 * The hero shared by the industry and service detail pages, so the two read
 * as one family: the dark stage, the page's photograph filling the right and
 * fading into the ink under the copy, and the name set as the page's h1.
 * `id="top"` puts the nav in its on-dark style while it sits over this.
 *
 * Not `PageHero`: that one is the About page's, with a smaller heading and a
 * wider fade sized for a two-line title and a stats row.
 */
export default function DetailHero({
  image,
  eyebrow,
  title,
  body,
  actions,
}: {
  image: string;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink-900 pb-20 pt-[150px] lg:flex lg:min-h-[640px] lg:items-center lg:pb-24"
    >
      <div aria-hidden className="absolute inset-0 lg:left-[34%]">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {/* Ink over the photo: solid under the copy, clearing to the right.
          On a phone the photo sits behind everything, so it is dimmed
          evenly instead. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-900/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,#21262A_0%,#21262A_34%,rgba(33,38,42,0.82)_38%,rgba(33,38,42,0.25)_52%,rgba(33,38,42,0.05)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />

      <Container wide className="relative z-10 w-full">
        <div className="max-w-[560px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-h2 text-paper">
            <KineticWords text={title} trigger="mount" />
          </h1>
          <Wipe delay={0.2}>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.7] text-paper/70">
              {body}
            </p>
          </Wipe>
          {actions && (
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
