"use client";

import { useId, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  ChartLine,
  Database,
  FileText,
  Layers,
  LayoutTemplate,
  Search,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
  Wallet,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { Feature } from "@/lib/case-study-view";
import type { Shot } from "@/lib/work-model";
import DetailHeading from "./DetailHeading";

/** A feature's glyph, read from its name. First match wins. */
const ICONS: [RegExp, LucideIcon][] = [
  [/clinic|ehr|care|medical|health/i, Stethoscope],
  [/bill|payment|revenue|financ|cost|pric|wallet|card|fee/i, Wallet],
  [/schedul|appointment|booking|calendar|session/i, CalendarDays],
  [/analytic|report|dashboard|insight|performance|visibility|monitor|forecast/i, ChartLine],
  [/role|access|secur|complian|kyc|identity|trust|verif/i, ShieldCheck],
  [/patient|user|profil|talent|member|avatar|people/i, UserRound],
  [/\bai\b|ai-|predict|intelligen|learn|vision|conversation/i, Brain],
  [/mobile|offline|app\b/i, Smartphone],
  [/search|discover|match|find/i, Search],
  [/data|master|record|registry/i, Database],
  [/form|template|builder|config/i, LayoutTemplate],
  [/document|content|publish|prescri/i, FileText],
  [/workflow|automat|process|routing|pipeline/i, Workflow],
];
const iconFor = (text: string) =>
  ICONS.find(([re]) => re.test(text))?.[1] ?? Layers;

/**
 * Key Features: what the platform does, one card per feature — glyph, name,
 * what it does and a capture of the product. The arrow turns the card over to
 * the challenge the feature answers.
 */
export default function KeyFeatures({
  features,
  shots,
  lead,
}: {
  features: Feature[];
  /** Captures to cycle through the cards. */
  shots: Shot[];
  lead?: string;
}) {
  if (features.length === 0) return null;

  return (
    <section
      aria-labelledby="features-heading"
      className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#F8FBFE_0%,#EEF5FC_100%)]"
    >
      {/* The Compliance & Governance band's ground, as the Product Showcase
          uses: a faint grid under two azure glows. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 90% 8%, rgba(68,158,216,0.14), transparent 70%), radial-gradient(35% 50% at 86% 78%, rgba(68,158,216,0.16), transparent 70%)",
        }}
      />
      <Container wide className="relative py-14 lg:py-20">
        <DetailHeading
          id="features-heading"
          eyebrow="Capabilities"
          title="Key Features"
          lead={lead}
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title + i}
              feature={feature}
              shot={shots.length > 0 ? shots[i % shots.length] : null}
            />
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FeatureCard({
  feature,
  shot,
}: {
  feature: Feature;
  shot: Shot | null;
}) {
  const [flipped, setFlipped] = useState(false);
  const panelId = useId();
  const Icon = iconFor(`${feature.title} ${feature.challengeTitle}`);

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-lg bg-paper-white ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35)] hover:ring-azure/50">
      <div className="flex gap-4 p-6">
        <span
          aria-hidden
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-azure-50 text-azure-600"
        >
          <Icon size={20} strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">
            {feature.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-[14px] leading-[1.6] text-ink-500">
            {feature.description}
          </p>
        </div>
      </div>

      {shot && (
        <div className="relative mx-6 mt-auto aspect-[16/9] overflow-hidden rounded-t-md bg-paper-deep ring-1 ring-line">
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
            className={cn(
              shot.kind === "mobile" ? "object-contain p-2" : "object-cover object-left-top",
            )}
          />
        </div>
      )}

      {/* The reverse: the challenge this feature answers. */}
      <div
        id={panelId}
        aria-hidden={!flipped}
        className={cn(
          "absolute inset-0 flex flex-col bg-ink-900 p-6 text-paper transition-[opacity,transform] duration-500 ease-smooth",
          flipped ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
          The challenge
        </span>
        <p className="mt-3 text-[17px] font-medium leading-[1.3]">
          {feature.challengeTitle}
        </p>
        <p className="mt-3 line-clamp-6 text-[14px] leading-[1.65] text-paper/70">
          {feature.challenge}
        </p>
      </div>

      {/* The whole card is the control; the round arrow in the corner is its
          visual cue and answers the card's hover. */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-expanded={flipped}
        aria-controls={panelId}
        aria-label={flipped ? "Back to the feature" : `The challenge behind ${feature.title}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure"
      >
        <span
          aria-hidden
          className={cn(
            "absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full shadow-[0_8px_20px_-8px_rgba(15,23,42,0.4)] transition-all duration-500 ease-expo",
            flipped
              ? "bg-paper text-ink group-hover:bg-amber group-hover:text-ink-900"
              : "bg-ink-900 text-paper group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink-900",
          )}
        >
          {flipped ? <X size={16} /> : <ArrowUpRight size={18} />}
        </span>
      </button>
    </li>
  );
}
