import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
  title: "Funavry Technologies — Build. Automate. Operate.",
  description:
    "Funavry is an AI-first engineering and Global Business Services partner. We build modern platforms, automate the work inside them, and operate them at global scale — so you get outcomes, not just software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
