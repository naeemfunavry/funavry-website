"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import type { Service } from "@/lib/services";
import { PHASE, SERVICE_ICONS, SERVICE_IMAGES } from "@/lib/service-style";
import { cn } from "@/lib/utils";

/* For a practice added in the CMS before it has a photograph of its own. */
const FALLBACK_PHOTO = "/services/digital-engineering.webp";

/**
 * Key practices as a split: the heading and a ruled list on the left, and on
 * the right a photograph that runs to the page's edge and fades into the
 * paper on its inner side. The photograph is the practice under the pointer
 * (or keyboard focus), crossfading as it moves down the list; at rest, the
 * first.
 */
export default function PracticesSplit({
  id,
  title,
  services,
}: {
  id: string;
  title: string;
  services: Service[];
}) {
  const [active, setActive] = useState(0);
  if (services.length === 0) return null;

  const current = services[active] ?? services[0];
  const photoFor = (s: Service) => SERVICE_IMAGES[s.slug] ?? FALLBACK_PHOTO;
  const photo = photoFor(current);
  /* Several practices can share the fallback, so each file is stacked once. */
  const photos = [...new Set(services.map(photoFor))];

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-white"
    >
      {/* The photograph — the right half of the band, bleeding off the page's
          edge, washed into the paper from its left. */}
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[50%] lg:block">
        <Photos photos={photos} active={photo} />
        <span className="absolute inset-0 bg-[linear-gradient(90deg,#FFFFFF_0%,rgba(255,255,255,0.85)_18%,rgba(255,255,255,0.25)_48%,rgba(255,255,255,0)_75%)]" />
        <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-paper-white to-transparent" />
        <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper-white to-transparent" />
      </div>

      <Container wide className="relative py-16 lg:py-24">
        <div className="lg:w-[48%]">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 flex-none bg-azure" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
              Practices
            </span>
          </div>
          <h2 id={id} className="mt-6 text-h3 text-ink">
            {title}
          </h2>

          {/* On a phone the photograph sits above the list instead. */}
          <div
            aria-hidden
            className="relative mt-8 aspect-[16/9] overflow-hidden lg:hidden"
          >
            <Photos photos={photos} active={photo} />
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-paper-white to-transparent" />
          </div>

          <ul className="mt-8 border-t border-line lg:mt-10">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon];
              const phase = PHASE[service.phase];
              const on = i === active;
              return (
                <li key={service.slug} className="border-b border-line">
                  <a
                    href={`/services/${service.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group relative flex items-center gap-4 py-4 outline-none lg:py-5"
                  >
                    {/* The open practice's hue, down its left edge. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-5 top-1/2 h-8 w-[3px] -translate-y-1/2 transition-opacity duration-300 sm:-left-6",
                        on ? "opacity-100" : "opacity-0",
                      )}
                      style={{ background: `rgb(${phase.tint})` }}
                    />
                    {Icon && (
                      <Icon
                        size={20}
                        strokeWidth={1.6}
                        aria-hidden
                        className="flex-none transition-colors duration-300"
                        style={{ color: on ? `rgb(${phase.tint})` : "#656B6D" }}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[16.5px] font-medium leading-snug tracking-[-0.015em] transition-colors duration-300 lg:text-[18px]",
                          on ? "text-ink" : "text-ink-500",
                        )}
                      >
                        {service.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "hidden flex-none font-mono text-[9.5px] uppercase tracking-[0.18em] sm:block",
                        phase.text,
                      )}
                    >
                      {service.phase}
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className={cn(
                        "flex-none transition-all duration-300 ease-expo",
                        on
                          ? "translate-x-0 text-ink opacity-100"
                          : "-translate-x-1 text-ink-400 opacity-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/**
 * Every practice's photograph, stacked, with only the active one showing.
 *
 * Mounting a fresh image per hover made the change jerk: the file only
 * started loading once hovered, so it popped in mid-fade, and the outgoing
 * photo faded out while the incoming one faded in, so the paper showed
 * through halfway. Here every photo is mounted, and so loaded, up front. The
 * incoming one fades in on top, while the outgoing one drops beneath it and
 * stays solid until the fade has finished, so there is never a gap to see.
 */
function Photos({ photos, active }: { photos: string[]; active: string }) {
  return (
    <div className="absolute inset-0 isolate">
      {photos.map((src) => {
        const on = src === active;
        return (
          <div
            key={src}
            className={cn(
              "absolute inset-0 transition-[opacity,transform] ease-expo motion-reduce:transition-none",
              on
                ? "z-10 scale-100 opacity-100 duration-700"
                : "z-0 scale-[1.03] opacity-0 duration-0 delay-700",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              quality={90}
              sizes="(max-width: 1024px) 92vw, 50vw"
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
