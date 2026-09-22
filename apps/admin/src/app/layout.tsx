import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

/* The site's two families, so content is edited in roughly the type it will be
   published in. Both are loaded normally here — unlike the public site, this
   is an authenticated tool with no LCP budget to protect. */
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Funavry CMS",
    template: "%s — Funavry CMS",
  },
  description: "Content management for funavry.com",
  /* Private tooling. Even behind authentication, there is no reason for a
     crawler that finds the hostname to index the login page. */
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
