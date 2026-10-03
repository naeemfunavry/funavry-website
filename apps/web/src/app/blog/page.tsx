import type { Metadata } from "next";
import Image from "next/image";
import { Newspaper, PenLine, Megaphone } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import { getPosts } from "@/lib/api";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { Eyebrow } from "@/components/ui/SectionLabel";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import type { Post } from "@/lib/posts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Blog & News",
  description:
    "Engineering and AI writing from the Funavry team — production agentic AI, document intelligence, retrieval that cites its sources, and news from our Global Capability Center advisory practice.",
};

const KIND_ICON = {
  Blog: PenLine,
  News: Megaphone,
  "Case Note": Newspaper,
} as const;

/* The articles are not published yet, so a card is an <article>, not a link —
   it states what is coming rather than pretending to open a post that isn't
   there. When a post ships, give it a real `href` and turn this into a link. */
function BlogCard({ post }: { post: Post }) {
  const Icon = KIND_ICON[post.kind];

  return (
    <Frame
      as="article"
      className="overflow-hidden"
      innerClassName="flex h-full flex-col"
    >
      <div className="relative aspect-[16/9] w-full flex-none overflow-hidden bg-ink-900">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 620px"
          className="object-cover transition-transform duration-700 ease-expo group-hover/frame:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-900/45 to-transparent"
        />
        <span className="absolute left-4 top-4 flex items-center gap-2 border border-paper-white/25 bg-ink-900/55 px-2.5 py-1 backdrop-blur-sm">
          <Icon size={13} strokeWidth={1.8} className="text-paper-white" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-white">
            {post.kind}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
          {post.date}
        </span>
        <h2 className="mt-4 text-[20px] font-medium leading-[1.22] tracking-[-0.025em] text-ink lg:text-[22px]">
          {post.title}
        </h2>
        <p className="mt-3.5 text-[14px] leading-[1.7] text-ink-400">
          {post.excerpt}
        </p>
        <span className="mt-auto flex items-center gap-2 pt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-azure" />
          Article coming soon
        </span>
      </div>
    </Frame>
  );
}

export default async function BlogPage() {
  const [chrome, POSTS] = await Promise.all([getChrome(), getPosts()]);

  return (
    <>
      <Nav services={chrome.services} industries={chrome.industries} socials={chrome.socials} />
      <main id="main">
        {/* ---------------------------------------------------- Hero ---- */}
        {/* The navy stage every other page opens on, so the nav takes its
            on-dark style here too (`id="top"`) and the blog no longer reads
            as a page from another site. */}
        <section
          id="top"
          className="relative overflow-hidden bg-[#102e54] pb-20 pt-[150px] lg:pb-24"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%),radial-gradient(40%_60%_at_85%_60%,rgba(245,159,19,0.08),transparent_70%)]"
          />
          <div aria-hidden className="absolute inset-0 grid-paper-dark" />

          <Container wide className="relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
              Blog &amp; News
            </span>

            <h1 className="mt-5 max-w-[16ch] text-h2 text-paper">
              <KineticWords text="What we're" trigger="mount" />
              <br />
              <KineticWords
                text="thinking about"
                delay={0.12}
                trigger="mount"
                wordClassName="text-sweep-dark"
              />
            </h1>

            <Wipe delay={0.15}>
              <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.7] text-paper/70">
                Engineering and AI writing from the team — how we put agentic AI
                into production, ground retrieval in its sources, and run
                document intelligence at scale, plus news from across the
                practice. New pieces are on the way.
              </p>
            </Wipe>
          </Container>
        </section>

        {/* -------------------------------------------------- Articles ---- */}
        <section className="border-b border-line bg-paper">
          <Container wide className="py-8 sm:py-12 lg:py-14">
            <div className="flex items-center justify-between gap-4">
              <Eyebrow label="Latest" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {POSTS.length} articles
              </span>
            </div>
            <Rule className="mt-8" />

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-7">
              {POSTS.map((post, i) => (
                <Wipe key={post.slug} delay={(i % 2) * 0.08} className="h-full">
                  <BlogCard post={post} />
                </Wipe>
              ))}
            </div>
          </Container>
        </section>

        <Contact />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}
