import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AboutSlider, { type AboutSlide } from "@/components/ui/AboutSlider";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

/** The photos the deck cycles through. Drop more into /public/about and list
    them here — the arrows and dots appear as soon as there are two. The frame
    crops to 16:10, so these are the landscape group shots; the About page's
    gallery carries the full set, portraits included. */
const SLIDES: AboutSlide[] = [
  {
    src: "/about/1.webp",
    alt: "The Funavry team seated and standing in rows before a Funavry and P@SHA backdrop at an outdoor event",
    caption: "The Funavry team",
  },
  {
    src: "/about/2.webp",
    alt: "The team gathered on the stairs and marble floor of the office lobby",
    caption: "The office lobby",
  },
  {
    src: "/about/7.webp",
    alt: "The team celebrating in the office under blue and white balloons",
    caption: "Celebrating at the office",
  },
  {
    src: "/about/5.webp",
    alt: "The whole team on a lawn below green hills on a company outing",
    caption: "Company day out",
  },
  {
    src: "/about/8.webp",
    alt: "A table-tennis match at the office, with colleagues crowded on the stairs to watch",
    caption: "Table tennis at the office",
  },
  {
    src: "/about/3.webp",
    alt: "The team gathered on a lakeside lawn with hills behind",
    caption: "By the lake",
  },
];

export default function Proof() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-12 sm:py-16 lg:py-20">
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
