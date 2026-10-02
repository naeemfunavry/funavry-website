import Image from "next/image";
import { Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

/* The message itself. Draft copy built only from the company's approved facts
   (2018, 500+ projects, 200+ engineers, the build–automate–operate model) —
   to be replaced with the CEO's own words once approved. */
/** The CEO has this section to himself, so the About page leaves him out of
    the leadership grid. */
export const CEO_NAME = "Dr. Adnan Tariq";

const CEO = {
  name: CEO_NAME,
  role: "Founder & CEO",
  photo: "/team/adnan-tariq.webp",
  headline:
    "We started Funavry to give businesses a partner that stays with the outcome, not just the code.",
  paragraphs: [
    "Since 2018 we have grown from a small engineering team into more than 200 engineers and specialists, and delivered over 500 projects for clients across nine countries. What has not changed is why we do the work: technology only matters when it changes how a business actually runs.",
    "That is why we build, automate and operate. We design and engineer the platform, put AI to work inside it, and keep it running at scale — so the results our clients were promised are the results they keep.",
    "Thank you for your interest in Funavry. Whether you are modernising a single system or standing up a global operation, we would be glad to build it with you.",
  ],
};

/**
 * Message From The CEO: the portrait on the left in a framed plate with the
 * name over its foot, the message on the right — a pull-quote headline, the
 * letter, then the signature.
 */
export default function CeoMessage() {
  return (
    <section
      aria-labelledby="about-ceo"
      className="relative overflow-hidden border-b border-line bg-paper"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 60% at 0% 50%, rgba(68,158,216,0.10), transparent 70%), radial-gradient(35% 50% at 100% 100%, rgba(245,159,19,0.08), transparent 70%)",
        }}
      />

      <Container wide className="relative py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-20">
          {/* ---- The portrait ---- */}
          <Wipe>
            <figure className="relative mx-auto w-full max-w-[420px]">
              {/* An offset plate behind the frame, in the logo's azure. */}
              <span
                aria-hidden
                className="absolute -bottom-4 -left-4 h-[70%] w-[70%] rounded-xl bg-azure/15 ring-1 ring-azure/25"
              />
              <span
                aria-hidden
                className="absolute -right-4 -top-4 h-24 w-24 rounded-xl grid-paper ring-1 ring-line-strong"
              />

              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep shadow-[0_40px_80px_-40px_rgba(15,43,64,0.55)] ring-1 ring-line">
                <Image
                  src={CEO.photo}
                  alt={`${CEO.name}, ${CEO.role} of Funavry`}
                  fill
                  quality={90}
                  sizes="(max-width: 1024px) 92vw, 420px"
                  className="object-cover object-top"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,43,64,0.92)_0%,rgba(15,43,64,0.45)_26%,transparent_50%)]"
                />
                <span aria-hidden className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-azure via-amber to-transparent" />

                <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[19px] font-semibold leading-snug tracking-[-0.015em] text-paper">
                    {CEO.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber">
                    {CEO.role}
                  </p>
                </figcaption>
              </div>
            </figure>
          </Wipe>

          {/* ---- The message ---- */}
          <Wipe delay={0.1}>
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                  Leadership
                </span>
              </div>
              <h2 id="about-ceo" className="mt-6 text-h3 text-ink">
                Message From The CEO
              </h2>

              <blockquote className="relative mt-8">
                <span
                  aria-hidden
                  className="absolute -left-1 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-azure text-paper shadow-[0_12px_24px_-10px_rgba(68,158,216,0.7)]"
                >
                  <Quote size={18} fill="currentColor" strokeWidth={0} />
                </span>
                <p className="pl-16 text-[20px] font-medium leading-[1.45] tracking-[-0.015em] text-ink lg:text-[24px]">
                  {CEO.headline}
                </p>

                <div className="mt-6 space-y-4 border-l-2 border-line-strong pl-6 lg:ml-16 lg:pl-8">
                  {CEO.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)} className="text-[15.5px] leading-[1.75] text-ink-500">
                      {p}
                    </p>
                  ))}
                </div>
              </blockquote>

              <div className="mt-8 flex items-center gap-4 lg:ml-16">
                <span aria-hidden className="h-px w-12 bg-amber" />
                <div>
                  <p className="font-serif text-[22px] italic leading-none text-ink">
                    {CEO.name}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {CEO.role}, Funavry
                  </p>
                </div>
              </div>
            </div>
          </Wipe>
        </div>
      </Container>
    </section>
  );
}
