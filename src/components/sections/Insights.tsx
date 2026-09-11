import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Newspaper,
  PenLine,
  Megaphone,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { POSTS, type Post } from "@/lib/posts";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  Blog: PenLine,
  News: Megaphone,
  "Case Note": Newspaper,
} as const;

/* The bento is drawn from distinct, deliberately-placed tiles rather than a
   uniform map — so each one is its own small component. The three flat-colour
   tiles carry the Build / Automate / Operate phase tints, the site's own answer
   to the reference's pastel blocks. */

const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
const rest = POSTS.filter((p) => p !== featured);
const [caseTile, leadTile, newsTile] = rest;

/* Real Funavry practice areas — safe to show as topic tags, nothing invented. */
const CATEGORIES = [
  "Artificial Intelligence",
  "Intelligent Automation",
  "Document Intelligence",
  "Data & BI",
  "Cloud & DevOps",
  "Blockchain",
  "GBS & Operating Models",
  "Quality Engineering",
];

const tileBase =
  "group/tile relative flex flex-col overflow-hidden border border-line transition-colors duration-500 hover:border-line-strong";

/* ------------------------------------------------- Featured image tile ---- */
function FeaturedTile({ post, className }: { post: Post; className?: string }) {
  const Icon = KIND_ICON[post.kind];
  return (
    <a
      href={post.href}
      className={cn(
        tileBase,
        "min-h-[440px] bg-ink-900 text-paper-white lg:min-h-0",
        className,
      )}
    >
      <Image
        src={post.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 34vw"
        className="object-cover transition-transform duration-700 ease-expo group-hover/tile:scale-[1.04]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-ink-900/25"
      />

      <span className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper-white/90 backdrop-blur">
        <Icon size={17} strokeWidth={1.8} className="text-amber-ink" />
      </span>

      <div className="relative z-10 mt-auto p-6 lg:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-white/70">
          Category · {post.kind}
          <span className="mx-2 text-paper-white/30">|</span>
          {post.date}
        </p>
        <h3 className="mt-3 max-w-[16ch] text-[clamp(24px,2.5vw,34px)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
          {post.title}
        </h3>
        <span className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper-white/80 transition-colors group-hover/tile:text-paper-white">
          Read
          <ArrowUpRight
            size={13}
            className="transition-transform duration-400 ease-expo group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}

/* --------------------------------------------- Lead headline + sub-links ---- */
function LeadTile({
  post,
  links,
  className,
}: {
  post: Post;
  links: Post[];
  className?: string;
}) {
  return (
    <div className={cn(tileBase, "bg-azure-50 p-6 lg:p-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-azure-ink">
          Category · {post.kind}
        </p>
        <a
          href={post.href}
          aria-label={`Read: ${post.title}`}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-azure-ink/25 text-azure-ink transition-colors hover:bg-azure-ink hover:text-paper-white"
        >
          <ArrowUpRight size={15} />
        </a>
      </div>

      <a href={post.href} className="group/lead mt-5 block">
        <h3 className="text-[clamp(22px,2.3vw,32px)] font-semibold uppercase leading-[1.08] tracking-[-0.02em] text-ink transition-colors group-hover/lead:text-azure-ink">
          {post.title}
        </h3>
      </a>

      <p className="mt-4 max-w-[52ch] text-[14px] leading-[1.7] text-ink-500">
        {post.excerpt}{" "}
        <a
          href={post.href}
          className="font-medium text-azure-ink underline underline-offset-2"
        >
          More
        </a>
      </p>

      <ul className="mt-auto divide-y divide-azure-ink/15 border-t border-azure-ink/15 pt-1">
        {links.map((l) => (
          <li key={l.slug}>
            <a
              href={l.href}
              className="group/row flex items-center justify-between gap-4 py-3.5"
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.02em] text-ink">
                {l.title}
              </span>
              <ArrowRight
                size={16}
                className="flex-none text-azure-ink transition-transform duration-400 ease-expo group-hover/row:translate-x-1"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------- Colour tile with an image ---- */
function ColorImageTile({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <a href={post.href} className={cn(tileBase, "bg-amber-50", className)}>
      <div className="flex flex-col gap-4 p-6 lg:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-ink">
          Category · {post.kind}
          <span className="mx-2 text-amber-ink/40">·</span>
          <span className="text-amber-ink/70">{post.date}</span>
        </p>
        <h3 className="text-[clamp(20px,1.9vw,26px)] font-semibold uppercase leading-[1.1] tracking-[-0.02em] text-ink transition-colors group-hover/tile:text-amber-ink">
          {post.title}
        </h3>
      </div>
      <div className="relative mt-auto aspect-[16/10] w-full overflow-hidden bg-ink-900">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-expo group-hover/tile:scale-[1.05]"
        />
      </div>
    </a>
  );
}

/* ---------------------------------------------------------- Media tile ---- */
function MediaTile({ post, className }: { post: Post; className?: string }) {
  return (
    <a
      href={post.href}
      className={cn(
        tileBase,
        "min-h-[240px] bg-ink-900 text-paper-white",
        className,
      )}
    >
      <Image
        src={post.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-expo group-hover/tile:scale-[1.05]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink-900/85 to-ink-900/10"
      />

      <span className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper-white/40 bg-ink-900/40 backdrop-blur transition-transform duration-400 ease-expo group-hover/tile:scale-110">
        <ArrowUpRight size={20} className="text-paper-white" />
      </span>

      <div className="relative z-10 mt-auto p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-white/70">
          Category · {post.kind}
          <span className="mx-2 text-paper-white/30">|</span>
          {post.date}
        </p>
        <h3 className="mt-2.5 max-w-[26ch] text-[18px] font-semibold uppercase leading-[1.14] tracking-[-0.015em]">
          {post.title}
        </h3>
      </div>
    </a>
  );
}

/* ----------------------------------------------------- Categories tile ---- */
function CategoriesTile({ className }: { className?: string }) {
  return (
    <div className={cn(tileBase, "bg-steel-50 p-6 lg:p-7", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-ink">
        Topics
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <span
            key={c}
            className="rounded-full border border-line bg-paper-white px-3 py-1.5 text-[12px] leading-none text-steel-ink"
          >
            {c}
          </span>
        ))}
      </div>

      <a
        href="/blog"
        className="group/all mt-auto flex items-center justify-between gap-4 pt-8"
      >
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          View all articles
        </span>
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-steel-ink/30 text-steel-ink transition-colors group-hover/all:bg-steel-ink group-hover/all:text-paper-white">
          <ArrowRight
            size={16}
            className="transition-transform duration-400 ease-expo group-hover/all:translate-x-0.5"
          />
        </span>
      </a>
    </div>
  );
}

export default function Insights() {
  return (
    <section
      id="insights"
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, rgba(68,158,216,0.06), transparent 60%), radial-gradient(90% 70% at 80% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
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
            <Button href="/blog" variant="secondary" size="md" arrow>
              All articles
            </Button>
          </Wipe>
        </div>

        <Rule className="mt-14" />

        {/* The bento: a tall featured image tile down the left, and a 2×2 field
            of coloured and media tiles filling the rest. Spans resolve on the
            12-column grid at lg; below that the tiles stack two-up, then one. */}
        <Wipe delay={0.15}>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(232px,auto)]">
            <FeaturedTile
              post={featured}
              className="sm:col-span-2 lg:col-span-4 lg:row-span-2"
            />
            <LeadTile
              post={leadTile}
              links={[caseTile, newsTile]}
              className="sm:col-span-2 lg:col-span-5"
            />
            <ColorImageTile post={newsTile} className="lg:col-span-3" />
            <MediaTile post={caseTile} className="lg:col-span-4" />
            <CategoriesTile className="sm:col-span-2 lg:col-span-4" />
          </div>
        </Wipe>
      </Container>
    </section>
  );
}
