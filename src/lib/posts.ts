/* -------------------------------------------------------------------------- *
 *  PLACEHOLDER CONTENT — these are article *slots*, not published pieces.
 *
 *  Titles describe work Funavry has genuinely delivered (drawn from the company
 *  profile), so they are safe to show, but no article exists behind them yet and
 *  no dates are invented — every `date` reads "Coming soon". The `image` on each
 *  is a topical illustration borrowed from the industries library, a stand-in
 *  until a real hero is shot. Wire each `href` to a published post and fill in
 *  `date` before launch.
 *
 *  Shared so the landing "Blog & News" deck and the /blog index render the same
 *  set from one source, not two drifting copies.
 * -------------------------------------------------------------------------- */

export type Post = {
  slug: string;
  kind: "Blog" | "News" | "Case Note";
  title: string;
  excerpt: string;
  date: string;
  /** Topical stand-in image; swap for a real hero when the post is published. */
  image: string;
  href: string;
  /** The one post the landing deck blows up into its 2×2 lead tile. */
  featured?: boolean;
};

export const POSTS: Post[] = [
  {
    slug: "agentic-ai-in-production",
    kind: "Blog",
    title: "Putting agentic AI into production without losing the audit trail",
    excerpt:
      "What it takes to move from an LLM demo to autonomous agents that regulators, auditors, and a board will sign off on.",
    date: "Coming soon",
    image: "/industries/enterprise.webp",
    href: "",
    featured: true,
  },
  {
    slug: "document-intelligence-insurance-reconciliation",
    kind: "Case Note",
    title: "Reconciling 150+ insurance carriers with document intelligence",
    excerpt:
      "How confidence scoring and human-in-the-loop review turned a four-day manual finance process into a controlled pipeline.",
    date: "Coming soon",
    image: "/industries/financial.webp",
    href: "",
  },
  {
    slug: "rag-tax-documents-source-grounding",
    kind: "Blog",
    title: "RAG over 230,000 tax documents: retrieval that cites its sources",
    excerpt:
      "Semantic and vector search across authoritative material, and why source-grounding was the feature that passed compliance.",
    date: "Coming soon",
    image: "/industries/government.webp",
    href: "",
  },
  {
    slug: "gcc-advisory-practice-expansion",
    kind: "News",
    title: "Funavry expands Global Capability Center advisory practice",
    excerpt:
      "Strategy, location advisory, setup, and scale-up support for enterprises building owned capability centers.",
    date: "Coming soon",
    image: "/industries/media.webp",
    href: "",
  },
];
