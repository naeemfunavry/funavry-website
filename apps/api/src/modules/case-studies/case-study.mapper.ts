import type {
  CaseStudyDetail,
  CaseStudySummary,
  MediaRef,
  SeoMeta,
} from "@funavry/types";

import {
  CaseStudyParagraphKind,
  type CaseStudyEntity,
  type MediaAssetEntity,
} from "src/database/entities";

/** Resolves a stored asset into the shape `next/image` can render directly. */
export function toMediaRef(
  entity: MediaAssetEntity | null | undefined,
  urlFor: (key: string) => string,
): MediaRef | null {
  if (!entity) return null;

  return {
    id: entity.id,
    url: urlFor(entity.storageKey),
    alt: entity.alt,
    width: entity.width,
    height: entity.height,
    blurDataUrl: entity.blurDataUrl,
    mimeType: entity.mimeType,
  };
}

function toSeo(
  entity: CaseStudyEntity,
  urlFor: (key: string) => string,
): SeoMeta {
  return {
    title: entity.seo?.title ?? null,
    description: entity.seo?.description ?? null,
    /* The og image is stored as a bare id rather than a relation, so it is not
       eagerly joined; null here means "not loaded on this query", and the
       detail endpoint joins it explicitly when it needs it. */
    ogImage: null,
    canonicalUrl: entity.seo?.canonicalUrl ?? null,
    noIndex: entity.seo?.noIndex ?? false,
  };
}

const byPosition = <T extends { position: number }>(a: T, b: T): number =>
  a.position - b.position;

/**
 * Entity → summary DTO, for the home deck and the index.
 *
 * Mapping explicitly is what keeps the wire format a decision. Returning the
 * entity would publish `updatedById`, `version`, `deletedAt` and every column
 * added later, and the two front-ends would quietly start depending on them.
 */
export function toCaseStudySummary(
  e: CaseStudyEntity,
  urlFor: (key: string) => string,
): CaseStudySummary {
  const capabilities = (e.capabilities ?? []).slice().sort(byPosition);

  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    tagline: e.tagline,
    sector: e.sector,
    phase: e.phase,
    surface: e.surface,
    frame: e.frame,
    summary: e.summary,
    client: e.client,
    team: e.team,
    featured: e.featured,
    position: e.position,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    publishedAt: e.publishedAt?.toISOString() ?? null,
    version: e.version,

    image: toMediaRef(e.image, urlFor),
    mobileImage: toMediaRef(e.mobileImage, urlFor),

    capabilities: capabilities.map((c) => ({
      id: c.id,
      label: c.label,
      position: c.position,
    })),

    callouts: (e.callouts ?? []).slice().sort(byPosition).map((c) => ({
      id: c.id,
      /* The label is read off the linked capability, never stored twice — that
         is what makes "a callout names one of this study's own capabilities"
         true by construction rather than by review. */
      label: c.capability?.label ?? "",
      capabilityId: c.capabilityId,
      icon: c.icon,
      x: Number(c.x),
      y: Number(c.y),
      position: c.position,
    })),

    highlights: (e.highlights ?? []).slice().sort(byPosition).map((h) => ({
      id: h.id,
      value: h.value,
      detail: h.detail,
      position: h.position,
    })),
  };
}

/** Everything `/case-studies/[slug]` needs, in one response. */
export function toCaseStudyDetail(
  e: CaseStudyEntity,
  urlFor: (key: string) => string,
): CaseStudyDetail {
  const paragraphs = (e.paragraphs ?? []).slice().sort(byPosition);

  return {
    ...toCaseStudySummary(e, urlFor),

    introHeading: e.introHeading,
    intro: paragraphs
      .filter((p) => p.kind === CaseStudyParagraphKind.INTRO)
      .map((p) => p.text),

    challengesLead: e.challengesLead ?? "",
    challenges: (e.challenges ?? []).slice().sort(byPosition).map((c) => ({
      id: c.id,
      title: c.title,
      challenge: c.challenge,
      solution: c.solution,
      position: c.position,
    })),

    resultsLead: e.resultsLead ?? "",
    results: paragraphs
      .filter((p) => p.kind === CaseStudyParagraphKind.RESULT)
      .map((p) => p.text),

    stats: (e.stats ?? []).slice().sort(byPosition).map((s) => ({
      id: s.id,
      value: s.value,
      label: s.label,
      position: s.position,
    })),

    meta: (e.metaRows ?? []).slice().sort(byPosition).map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      position: m.position,
    })),

    screenshots: (e.screenshots ?? []).slice().sort(byPosition).map((s) => ({
      id: s.id,
      media: toMediaRef(s.media, urlFor) ?? {
        id: s.mediaId,
        url: "",
        alt: "",
        width: null,
        height: null,
        blurDataUrl: null,
        mimeType: "",
      },
      fit: s.fit,
      lead: s.lead,
      position: s.position,
    })),

    seo: toSeo(e, urlFor),

    industrySlugs: (e.industries ?? []).map((i) => i.slug),
    serviceSlugs: (e.services ?? []).map((s) => s.slug),
  };
}
