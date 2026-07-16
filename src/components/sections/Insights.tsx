import { ArrowUpRight, Newspaper, PenLine, Megaphone } from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- *
 *  PLACEHOLDER CONTENT — these are article *slots*, not published pieces.
 *
 *  Titles describe work Funavry has genuinely delivered (drawn from the
 *  company profile), so they are safe to show, but no article exists behind
 *  them yet and no dates are invented. Wire each `href` to a real post and
 *  fill in `date` before launch.
 * -------------------------------------------------------------------------- */

type Post = {
  kind: "Blog" | "News" | "Case Note";
  title: string;
  excerpt: string;
  date: string;
  href: string;
  featured?: boolean;
};

const POSTS: Post[] = [
  {
    kind: "Blog",
    title: "Putting agentic AI into production without losing the audit trail",
    excerpt:
      "What it takes to move from an LLM demo to autonomous agents that regulators, auditors, and a board will sign off on.",
    date: "Coming soon",
    href: "#insights",
    featured: true,
  },
  {
    kind: "Case Note",
    title: "Reconciling 150+ insurance carriers with document intelligence",
    excerpt:
      "How confidence scoring and human-in-the-loop review turned a four-day manual finance process into a controlled pipeline.",
    date: "Coming soon",
    href: "#insights",
  },
  {
    kind: "Blog",
    title: "RAG over 230,000 tax documents: retrieval that cites its sources",
    excerpt:
      "Semantic and vector search across authoritative material, and why source-grounding was the feature that passed compliance.",
    date: "Coming soon",
    href: "#insights",
  },
  {
    kind: "News",
    title: "Funavry expands Global Capability Center advisory practice",
    excerpt:
      "Strategy, location advisory, setup, and scale-up support for enterprises building owned capability centers.",
    date: "Coming soon",
    href: "#insights",
  },
];

const KIND_ICON = {
  Blog: PenLine,
  News: Megaphone,
  "Case Note": Newspaper,
} as const;

function PostCard({ post }: { post: Post }) {
  const Icon = KIND_ICON[post.kind];

  return (
    <Frame
      as="a"
      href={post.href}
      className="h-full"
      innerClassName="flex h-full flex-col p-6 lg:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2.5">
          <Icon size={15} strokeWidth={1.6} className="text-azure" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-500">
            {post.kind}
          </span>
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
          {post.date}
        </span>
      </div>

      <h3
        className={cn(
          "mt-8 font-medium leading-[1.2] tracking-[-0.025em] text-ink",
          post.featured ? "max-w-[18ch] text-[clamp(24px,2.6vw,36px)]" : "text-[18px]"
        )}
      >
        {post.title}
      </h3>

      <p
        className={cn(
          "mt-3.5 leading-[1.65] text-ink-400",
          post.featured ? "max-w-[46ch] text-[15px]" : "text-[13.5px]"
        )}
      >
        {post.excerpt}
      </p>

      <span className="mt-auto flex items-center gap-2 pt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500 transition-colors group-hover/frame:text-ink">
        Read
        <ArrowUpRight
          size={13}
          className="transition-transform duration-400 ease-expo group-hover/frame:-translate-y-0.5 group-hover/frame:translate-x-0.5"
        />
      </span>
    </Frame>
  );
}

export default function Insights() {
  return (
    <section id="insights" className="relative overflow-hidden border-t border-line bg-paper-deep">
      <Container wide className="relative z-10 py-24 lg:py-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Blog &amp; News
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="What we're" />
              <br />
              <KineticWords text="thinking about." delay={0.12} />
            </h2>
          </div>

          <Wipe delay={0.2} className="lg:pb-2">
            <Button href="#insights" variant="secondary" size="md" arrow>
              All articles
            </Button>
          </Wipe>
        </div>

        <Rule className="mt-14" />

        {/* Featured post holds a 2x2 block on the left; the two short posts sit
            beside it and the last one runs under them. Spans must live on the
            grid child, which is the Wipe wrapper rather than the card. */}
        <div className="mt-10 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((post, i) => (
            <Wipe
              key={post.title}
              delay={i * 0.06}
              duration={0.85}
              className={cn(
                "h-full",
                post.featured && "sm:col-span-2 lg:row-span-2",
                i === POSTS.length - 1 && "lg:col-span-2"
              )}
            >
              <PostCard post={post} />
            </Wipe>
          ))}
        </div>
      </Container>
    </section>
  );
}
