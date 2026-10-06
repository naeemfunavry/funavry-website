import {
  Eye,
  Handshake,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";

/** What the team works by — the same six values as the Core Values cards,
    set under the hero's actions where the About page carries its figures. */
const VALUES: { title: string; icon: LucideIcon; text: string }[] = [
  { title: "Talent", icon: Users, text: "text-amber" },
  { title: "Vision", icon: Eye, text: "text-azure-300" },
  { title: "Innovation", icon: Sparkles, text: "text-amber" },
  { title: "Connection", icon: Handshake, text: "text-azure-300" },
  { title: "Impact", icon: Target, text: "text-amber" },
  { title: "Growth", icon: TrendingUp, text: "text-azure-300" },
];

/**
 * The Life @ Funavry opener — the shared `PageHero`, so it opens the way the
 * About, industry and service pages do: the team's photograph on the right
 * fading into the navy under the copy, and the team's values under the
 * actions.
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
          <Button href="/careers" variant="outline" size="md">
            Join our team
          </Button>
        </>
      }
    >
      <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-paper/15 pt-8 sm:grid-cols-3">
        {VALUES.map(({ title, icon: Icon, text }) => (
          <li key={title} className="flex flex-col gap-2.5">
            <Icon size={22} strokeWidth={1.6} aria-hidden className={text} />
            <span className="text-[16px] font-semibold leading-snug tracking-[-0.01em] text-paper">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </PageHero>
  );
}
