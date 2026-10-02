import Image from "next/image";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";
import type { LeaderCard } from "@/lib/api";

/**
 * Portraits in /public/team, keyed by name: 960x1200 (4:5) crops, framed head
 * and shoulders so the set reads as one. They take priority over the CMS's
 * original uploads; a leader not listed here uses the CMS photo, and one with
 * neither gets their initials.
 */
const PORTRAITS: Record<string, string> = {
  "Salman Tariq": "/team/salman-tariq.webp",
  "Imran Khawar": "/team/imran-khawar.webp",
  "Imran Ashraf": "/team/imran-ashraf.webp",
  "Irfan Ayub": "/team/irfan-ayub.webp",
};

const portraitFor = (leader: LeaderCard) =>
  PORTRAITS[leader.name] || leader.photo;

/**
 * The leadership team on the dark stage: a full portrait per leader with the
 * name and role over its foot. Hovering draws the ink up over the portrait and
 * brings the leader's record in above the name. The card is focusable, so a
 * keyboard reaches the same view — and so does a tap on a touch screen, which
 * focuses it; tapping elsewhere closes it again.
 */
export default function Leadership({ leaders }: { leaders: LeaderCard[] }) {
  if (leaders.length === 0) return null;

  return (
    <section
      aria-labelledby="about-leadership"
      className="relative overflow-hidden border-b border-line bg-paper"
    >
      {/* A light stage: paper under the drafting grid, with soft azure and
          amber glows. The portraits keep their own dark foot for the name. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(55% 60% at 10% 10%, rgba(68,158,216,0.10), transparent 65%)",
            "radial-gradient(45% 55% at 95% 95%, rgba(245,159,19,0.07), transparent 65%)",
          ].join(","),
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

      <Container wide className="relative py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Leadership Team
              </span>
            </div>
            <h2 id="about-leadership" className="mt-6 text-h3 text-ink">
              The people who set how we work.
            </h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            <span className="[@media(hover:none)]:hidden">Hover</span>
            <span className="hidden [@media(hover:none)]:inline">Tap</span> a
            portrait for more
          </p>
        </div>

        {/* One row on a wide screen, however many leaders there are. */}
        <ul
          className={`mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 ${
            leaders.length >= 5 ? "sm:grid-cols-3 lg:grid-cols-5" : "lg:grid-cols-4"
          }`}
        >
          {leaders.map((leader, i) => {
            const photo = portraitFor(leader);
            return (
              <li key={leader.name}>
                <Wipe delay={i * 0.06}>
                  <article
                    tabIndex={0}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-[#102e54] shadow-[0_24px_48px_-28px_rgba(16,46,84,0.55)] outline-none ring-amber focus-visible:ring-2"
                  >
                    {photo ? (
                      <Image
                        src={photo}
                        alt={`${leader.name}, ${leader.role}`}
                        fill
                        quality={88}
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px"
                        className="object-cover object-top grayscale-[35%] transition-all duration-[900ms] ease-expo group-hover:scale-[1.04] group-hover:grayscale-0 group-focus:grayscale-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center grid-paper-dark">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-paper/20 font-mono text-[22px] tracking-[0.04em] text-paper/70">
                          {leader.initials}
                        </span>
                      </div>
                    )}

                    {/* The ink: a foot for the name at rest, drawn up over
                        the whole portrait when the record is showing. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(0deg,rgba(16,46,84,0.95)_0%,rgba(16,46,84,0.55)_32%,transparent_60%)] transition-opacity duration-500"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[#102e54]/90 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100 group-focus:opacity-100"
                    />
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-[3px] w-10 bg-amber transition-all duration-500 ease-expo group-hover:w-full group-focus:w-full"
                    />

                    {/* The whole card is the stage, so the record can never
                        grow past its top: it takes what room is left above
                        the name, and scrolls in the rare case it needs more. */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                      {/* The record — collapsed to nothing at rest. */}
                      <div className="grid min-h-0 grid-rows-[minmax(0,0fr)] transition-[grid-template-rows] duration-500 ease-expo group-hover:grid-rows-[minmax(0,1fr)] group-focus:grid-rows-[minmax(0,1fr)]">
                        <div className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <ul className="space-y-2 pb-4 pt-2 text-[12.5px] leading-[1.5] text-paper/85 opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100 group-focus:opacity-100">
                            {leader.points.map((point) => (
                              <li key={point} className="flex gap-2.5">
                                <span
                                  aria-hidden
                                  className="mt-[6px] h-1 w-1 flex-none rounded-full bg-amber"
                                />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-none items-end justify-between gap-4 border-t border-paper/15 pt-4">
                        <div>
                          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.015em] text-paper lg:text-[18px]">
                            {leader.name}
                          </h3>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
                            {leader.role}
                          </p>
                        </div>
                        {leader.points.length > 0 && (
                          <span
                            aria-hidden
                            className="flex h-8 w-8 flex-none items-center justify-center border border-paper/25 text-paper transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:border-amber group-hover:bg-amber group-hover:text-ink-900 group-focus:rotate-45 group-focus:border-amber group-focus:bg-amber group-focus:text-ink-900"
                          >
                            <Plus size={15} />
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Wipe>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
