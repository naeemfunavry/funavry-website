import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import { SOCIALS } from "@/lib/socials";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

/* Only the weights the site actually sets: `font-medium` (500),
   `font-semibold` (600) and one `font-bold` (700), plus 400 as the body
   default and the 500/600 the display ramp in `tailwind.config.ts` bakes into
   its own fontSize entries. Nothing renders at 300, 800 or 900.

   Worth knowing before anyone counts this as a saving: it isn't one. Urbanist
   ships from Google as a variable font, so `next/font` emits axis-based files
   and the built output is byte-identical whether this list holds four weights
   or seven — measured, not assumed. The list is trimmed because it documents
   what the design actually uses, not because it made the page lighter. */
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
});

/* Not preloaded, unlike Urbanist. `next/font` emits a `<link rel="preload">`
   for every family by default, so the phone was opening two competing font
   requests on the critical path — and only one of them draws the LCP element.
   Urbanist sets the headline and the intro paragraph; JetBrains Mono sets
   eyebrow labels and small caps, none of which is the LCP candidate.

   Dropping the preload hands that bandwidth and connection back to Urbanist,
   which is the font LCP actually waits on. Mono still loads, just at normal
   priority once the stylesheet references it. `display: swap` covers the gap:
   the eyebrow label renders immediately in the fallback and swaps when the
   file lands, which is the correct trade for a 10px label. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Funavry Technologies — Build. Automate. Operate.",
    template: "%s — Funavry Technologies",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Funavry Technologies",
    title: "Funavry Technologies — Build. Automate. Operate.",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Funavry Technologies — Build. Automate. Operate.",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* Organization entity for the knowledge graph. `sameAs` reuses the same social
   profiles the footer already links — treat them as unconfirmed until the
   handles in `@/lib/socials` are verified, since a wrong sameAs points Google
   at the wrong entity. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/funavry-logo.svg`,
  description: SITE_DESCRIPTION,
  sameAs: SOCIALS.map((s) => s.href),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          // Static, build-time JSON from our own constants — no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Bypass Blocks (WCAG 2.4.1, Level A). The header is a mega-menu with
            roughly thirty links in it, and without this a keyboard or switch
            user tabbed the whole thing again on every route before reaching any
            content. Visually hidden until focused, then it lands as a normal
            focusable control at the top-left.

            `sr-only` alone would not do: the link has to become visible when it
            takes focus, or a sighted keyboard user sees focus vanish into
            nothing. */}
        <a
          href="#main"
          className="sr-only rounded-sm bg-ink px-4 py-3 text-[14px] font-medium text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to main content
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
