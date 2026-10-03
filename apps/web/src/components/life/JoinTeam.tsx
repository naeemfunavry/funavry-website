import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroActions from "@/components/ui/HeroActions";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

const WORDS = [
  { word: "Ideas", dot: "bg-azure" },
  { word: "People", dot: "bg-amber" },
  { word: "Growth", dot: "bg-steel-300" },
  { word: "Impact", dot: "bg-amber" },
];

/**
 * The page's close: a navy panel asking the reader to join, with a dashed
 * flight path drawn across its right side and the four words the team grows
 * on set beside it.
 */
export default function JoinTeam() {
  return (
    <section aria-labelledby="life-join" className="relative bg-paper py-8 sm:py-12 lg:py-14">
      <Container wide>
        <Wipe>
          <div className="relative isolate overflow-hidden bg-[#102e54] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div aria-hidden className="absolute inset-0 -z-10 grid-paper-dark" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(45%_90%_at_0%_0%,rgba(68,158,216,0.25),transparent_70%),radial-gradient(35%_80%_at_100%_100%,rgba(245,159,19,0.14),transparent_70%)]"
            />
            <span aria-hidden className="absolute left-0 top-0 h-[3px] w-24 bg-amber" />

            {/* The flight path, from lg. */}
            <svg
              aria-hidden
              viewBox="0 0 520 240"
              fill="none"
              className="absolute right-[16%] top-1/2 -z-10 hidden h-[240px] w-[520px] -translate-y-1/2 lg:block"
            >
              <path
                d="M10 200 C 120 240, 170 120, 120 90 S 40 120, 110 170 S 300 230, 360 140 S 450 40, 505 30"
                stroke="rgba(143,202,235,0.55)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
              />
              <circle cx="110" cy="170" r="4" fill="#449ED8" />
              <circle cx="360" cy="140" r="4" fill="#F59F13" />
            </svg>
            <Send
              aria-hidden
              size={44}
              strokeWidth={1.4}
              className="absolute right-[15%] top-[18%] hidden -rotate-6 text-amber lg:block"
            />

            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[560px]">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-amber" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60">
                    Let&apos;s grow together
                  </span>
                </div>
                <h2 id="life-join" className="mt-6 text-h3 text-paper">
                  Be part of a team that{" "}
                  <span className="text-amber">creates impact.</span>
                </h2>
                <p className="mt-5 max-w-[46ch] text-[15.5px] leading-[1.7] text-paper/70">
                  Grow with a team that values people, innovation and real
                  impact. Tell us about yourself — we&apos;d love to hear from you.
                </p>
                <HeroActions className="mt-8">
                  <Button href="/careers" variant="accent" size="md" arrow>
                    Join our team
                  </Button>
                  <Button href="/about" variant="outline" size="md">
                    About Funavry
                  </Button>
                </HeroActions>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-3 lg:flex-col lg:gap-3">
                {WORDS.map(({ word, dot }) => (
                  <li
                    key={word}
                    className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/75"
                  >
                    <span aria-hidden className={`h-1.5 w-1.5 flex-none rounded-full ${dot}`} />
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Wipe>
      </Container>
    </section>
  );
}
