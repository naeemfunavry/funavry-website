import {
  BarChart3,
  Handshake,
  Lightbulb,
  Sparkles,
  Sprout,
  Users,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";

/** What the team is made of, set under the hero's actions where the About
    page carries its figures. */
const PILLARS: { label: string; icon: LucideIcon; text: string }[] = [
  { label: "People", icon: Users, text: "text-azure-300" },
  { label: "Ideas", icon: Lightbulb, text: "text-amber" },
  { label: "Collaboration", icon: Handshake, text: "text-azure-300" },
  { label: "Innovation", icon: Sparkles, text: "text-amber" },
  { label: "Growth", icon: Sprout, text: "text-azure-300" },
  { label: "Impact", icon: BarChart3, text: "text-amber" },
];

/**
 * The Life @ Funavry opener — the shared `PageHero`, so it opens the way the
 * About, industry and service pages do: the team's photograph on the right
 * fading into the navy under the copy, and the six things the team is made of
 * in a row under the actions.
 */
export default function LifeHero() {
  return (
    <PageHero
      image={{ src: "/about/5.webp", position: "center 45%" }}
      eyebrow="Life @ Funavry"
      title={["People, ideas and possibilities", "stronger together."]}
      body="At Funavry we are a team of curious minds, problem solvers and builders who believe in using technology to create real impact. We learn, collaborate and grow together — and enjoy the journey along the way."
      actions={
        <>
          <Button href="#moments" variant="accent" size="md" arrow>
            See the moments
          </Button>
          <Button href="/contact" variant="outline" size="md">
            Join our team
          </Button>
        </>
      }
    >
      <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-paper/15 pt-8 sm:grid-cols-3">
        {PILLARS.map(({ label, icon: Icon, text }) => (
          <li key={label} className="flex flex-col gap-2.5">
            <Icon size={22} strokeWidth={1.6} aria-hidden className={text} />
            <span className="font-mono text-[10px] uppercase leading-[1.5] tracking-[0.16em] text-paper/55">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </PageHero>
  );
}
