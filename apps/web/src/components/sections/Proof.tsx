import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AboutSlider, { type AboutSlide } from "@/components/ui/AboutSlider";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

/** The photos the deck cycles through. Drop more into /public/about and list
    them here — the arrows and dots appear as soon as there are two. */
const SLIDES: AboutSlide[] = [
  {
    src: "/about/team.webp",
    alt: "The Funavry team gathered outside the Islamabad engineering centre",
    caption: "The Funavry team · Islamabad engineering centre",
  },
  {
    src: "/about/team-2.webp",
    alt: "The Funavry team gathered outside the Islamabad engineering centre",
    caption: "The Funavry team · Islamabad engineering centre",
  },
  {
    src: "/about/team-3.webp",
    alt: "The Funavry team gathered outside the Islamabad engineering centre",
    caption: "The Funavry team · Islamabad engineering centre",
  },
];

export default function Proof() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Left — who we are. */}
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Life @ Funavry
              </span>
            </div>

            <h2 className="mt-6 text-h2 text-ink">
              <KineticWords text="An AI-first technology" />
              <br />
              <KineticWords
                text="company, since 2018."
                delay={0.12}
                wordClassName="text-sweep"
              />
            </h2>

            <Wipe delay={0.18}>
              <p className="mt-7 max-w-[46ch] text-lg leading-[1.75] text-ink-500">
                We combine deep domain expertise with AI, intelligent automation
                and modern engineering — and, uniquely, with the operating-model
                experience to change how work is done, not just the software it
                runs on.
              </p>
            </Wipe>

            <div className="mt-9">
              <Button href="/about" variant="secondary" size="md" arrow>
                Meet the company
              </Button>
            </div>
          </div>

          {/* Right — the photo deck. */}
          <Wipe delay={0.12}>
            <AboutSlider slides={SLIDES} />
          </Wipe>
        </div>
      </Container>
    </section>
  );
}
