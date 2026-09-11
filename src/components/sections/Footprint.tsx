import { MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import WorldMap from "@/components/ui/WorldMap";
import { Wipe } from "@/components/ui/Kinetic";
import { Eyebrow, TextLink } from "@/components/ui/SectionLabel";
import { OFFICES, DELIVERY_COUNTRIES } from "@/lib/offices";

/**
 * The offices and delivery reach, as one band: intro and headline figures on
 * the left, the delivery map in the middle, the offices on the right, and the
 * countries served underneath. Shared by the About and Contact pages, and drawn
 * entirely from `@/lib/offices`, so neither page can drift from the other.
 */
export default function Footprint({
  eyebrow = "Our locations",
  title = "Where we work.",
  action,
}: {
  eyebrow?: string;
  title?: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="border-y border-line bg-paper-deep">
      <Container wide className="py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,280px)] lg:items-center lg:gap-12">
          <div>
            <Eyebrow label={eyebrow} />
            <h2 className="mt-6 text-h3 text-ink">{title}</h2>
            <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] text-ink-500">
              Regional offices in the United States, Saudi Arabia and Pakistan,
              a 17,000 sq ft engineering and delivery center, and delivery
              across {DELIVERY_COUNTRIES.length} countries.
            </p>
            <dl className="mt-8 flex gap-10">
              {[
                { value: `${OFFICES.length}`, label: "Offices" },
                {
                  value: `${DELIVERY_COUNTRIES.length}`,
                  label: "Countries served",
                },
              ].map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
                    {s.label}
                  </dt>
                  <dd className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            {action && (
              <div className="mt-8">
                <TextLink href={action.href}>{action.label}</TextLink>
              </div>
            )}
          </div>

          <Wipe>
            <WorldMap />
          </Wipe>

          <ul className="divide-y divide-line border-y border-line lg:border-y-0 lg:border-l lg:pl-10">
            {OFFICES.map((o) => (
              <li key={o.city} className="flex gap-4 py-5">
                <MapPin
                  size={18}
                  strokeWidth={2}
                  className="mt-0.5 flex-none text-azure"
                />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {o.country}
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                      {o.city}
                    </h3>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.flag}
                      alt={`${o.country} flag`}
                      loading="lazy"
                      className="h-3.5 w-5 flex-none object-cover ring-1 ring-line-strong"
                    />
                  </div>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-ink-500">
                    {o.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-8">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-azure-ink">
            Delivery across
          </span>
          {DELIVERY_COUNTRIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-line bg-paper-white px-3.5 py-1.5 text-[12.5px] leading-none text-ink-700"
            >
              {c}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
