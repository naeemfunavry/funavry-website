import {
  CaseStudyFrame,
  CaseStudySurface,
  ContentStatus,
  DeliveryPhase,
  MediaPurpose,
  PostKind,
  ServiceGroup,
} from "@funavry/types";
import type { DataSource, EntityManager } from "typeorm";

import {
  CaseStudyCalloutEntity,
  CaseStudyCapabilityEntity,
  CaseStudyChallengeEntity,
  CaseStudyEntity,
  CaseStudyHighlightEntity,
  CaseStudyMetaRowEntity,
  CaseStudyParagraphEntity,
  CaseStudyParagraphKind,
  CaseStudyScreenshotEntity,
  CaseStudyStatEntity,
  ClientEntity,
  DeliveryCountryEntity,
  IndustryEntity,
  LeaderEntity,
  LeaderPointEntity,
  OfficeAddressLineEntity,
  OfficeEntity,
  PostEntity,
  ServiceEntity,
  ServiceSubEntity,
  SocialLinkEntity,
  StatEntity,
  TestimonialEntity,
} from "../entities";
import type { MediaSeeder } from "./media.seed";
import snapshot from "./data/web-content.json";

/* ------------------------------------------------------------------ types */

interface DeckStudy {
  slug: string;
  surface?: string;
  frame?: string;
  capabilities?: string[];
  callouts?: { label: string; icon: string; at: { x: number; y: number } }[];
  highlights?: { value: string; detail: string }[];
  client?: string;
  team?: string;
  featured?: boolean;
  image?: string;
  mobileImage?: string;
}

interface DetailStudy {
  slug: string;
  title: string;
  tagline: string;
  sector: string;
  phase: string;
  summary: string;
  stats: { value: string; label: string }[];
  meta: { label: string; value: string }[];
  introHeading: string;
  intro: string[];
  challengesLead: string;
  challenges: { title: string; challenge: string; solution: string }[];
  resultsLead: string;
  results: string[];
  screenshots: { src: string; alt: string; fit?: string; lead?: boolean }[];
}

/** ISO alpha-2 for the countries the profile lists. */
const COUNTRY_CODES: Record<string, string> = {
  USA: "US",
  UK: "GB",
  UAE: "AE",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  Australia: "AU",
  Japan: "JP",
  Pakistan: "PK",
  "Costa Rica": "CR",
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 130) || "item";

const toPhase = (value: string): DeliveryPhase =>
  value === "Automate"
    ? DeliveryPhase.AUTOMATE
    : value === "Operate"
      ? DeliveryPhase.OPERATE
      : DeliveryPhase.BUILD;

/**
 * Imports the website's hardcoded content into the database.
 *
 * Everything is seeded as PUBLISHED, because all of it is already live on
 * funavry.com — seeding it as DRAFT would take the site down the moment the
 * pages start reading from the API.
 *
 * Idempotent by slug throughout: re-running updates the row it finds rather
 * than inserting a duplicate, so this can be re-run after an extraction fix
 * without wiping the database first.
 */
export async function seedContent(
  dataSource: DataSource,
  mediaSeeder: MediaSeeder,
  log: (message: string) => void,
): Promise<void> {
  const data = snapshot as unknown as {
    clients: { name: string; file: string }[];
    testimonials: {
      quote: string;
      author: string;
      role: string;
      company: string;
      image: string;
      pending?: boolean;
    }[];
    leaders: {
      name: string;
      role: string;
      initials: string;
      photo: string;
      points: string[];
    }[];
    stats: { value: string; label: string }[];
    caseStudyDeck: DeckStudy[];
    caseStudyDetails: DetailStudy[];
    services: {
      n: string;
      slug: string;
      title: string;
      group: string;
      phase: string;
      icon: string;
      summary: string;
      subs: { title: string; desc: string }[];
    }[];
    industries: {
      slug: string;
      name: string;
      desc: string;
      proof: string;
      image: string;
    }[];
    offices: {
      flag: string;
      country: string;
      city: string;
      role: string;
      blurb: string;
      address: string[];
      at: { lon: number; lat: number };
    }[];
    deliveryCountries: string[];
    posts: {
      slug: string;
      kind: string;
      title: string;
      excerpt: string;
      date: string;
      image: string;
      href: string;
      featured?: boolean;
    }[];
    serviceWork: Record<string, string[]>;
    socials: { label: string; href: string; icon: string }[];
  };

  await dataSource.transaction(async (manager) => {
    /* Media writes must run on this transaction's connection — see the note on
       MediaSeeder.withManager. */
    const media = mediaSeeder.withManager(manager);

    /* --------------------------------------------------------- industries */

    const industryBySlug = new Map<string, IndustryEntity>();
    /* Also keyed by name, because a case study's industry comes from its brief's
       "Industry" meta row as prose, not as a slug. */
    const industryByName = new Map<string, IndustryEntity>();

    for (const [index, source] of data.industries.entries()) {
      const imageId = await media.importByPublicPath(
        source.image,
        MediaPurpose.INDUSTRY_COVER,
        `${source.name} — industry`,
      );

      const entity = await upsert(manager, IndustryEntity, { slug: source.slug }, {
        slug: source.slug,
        name: source.name,
        description: source.desc,
        proof: source.proof,
        imageId,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
        seo: {
          title: null,
          description: null,
          ogImageId: null,
          canonicalUrl: null,
          noIndex: false,
        },
      });

      industryBySlug.set(source.slug, entity);
      industryByName.set(source.name.toLowerCase(), entity);
    }

    log(`  industries: ${industryBySlug.size}`);

    /* ------------------------------------------------------- case studies */

    const deckBySlug = new Map(data.caseStudyDeck.map((d) => [d.slug, d]));
    const studyBySlug = new Map<string, CaseStudyEntity>();

    for (const [index, detail] of data.caseStudyDetails.entries()) {
      const deck = deckBySlug.get(detail.slug);

      const imageId = deck?.image
        ? await media.importByPublicPath(
            deck.image,
            MediaPurpose.CASE_STUDY_CAPTURE,
            `${detail.title} — product capture`,
          )
        : /* Not on the deck: the first screenshot stands in as the card image,
             which is what the index already does when there is no deck entry. */
          detail.screenshots[0]
          ? await media.importByPublicPath(
              detail.screenshots[0].src,
              MediaPurpose.CASE_STUDY_CAPTURE,
              detail.screenshots[0].alt,
            )
          : null;

      const mobileImageId = deck?.mobileImage
        ? await media.importByPublicPath(
            deck.mobileImage,
            MediaPurpose.CASE_STUDY_MOBILE,
            `${detail.title} — mobile capture`,
          )
        : null;

      const study = await upsert(manager, CaseStudyEntity, { slug: detail.slug }, {
        slug: detail.slug,
        title: detail.title,
        tagline: detail.tagline,
        sector: detail.sector,
        phase: toPhase(detail.phase),
        surface:
          deck?.surface === "site" ? CaseStudySurface.SITE : CaseStudySurface.APP,
        frame: deck?.frame === "laptop" ? CaseStudyFrame.LAPTOP : CaseStudyFrame.WINDOW,
        summary: detail.summary,
        client: deck?.client ?? null,
        team: deck?.team ?? null,
        featured: deck?.featured ?? false,
        introHeading: detail.introHeading,
        challengesLead: detail.challengesLead,
        resultsLead: detail.resultsLead,
        imageId,
        mobileImageId,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
        seo: {
          title: null,
          description: null,
          ogImageId: null,
          canonicalUrl: null,
          noIndex: false,
        },
      });

      studyBySlug.set(detail.slug, study);

      /* Children are rewritten wholesale so a re-run converges rather than
         accumulating duplicates. Callouts go first — their foreign key into
         capabilities is RESTRICT. */
      await manager.delete(CaseStudyCalloutEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyCapabilityEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyHighlightEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyStatEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyMetaRowEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyParagraphEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyChallengeEntity, { caseStudyId: study.id });
      await manager.delete(CaseStudyScreenshotEntity, { caseStudyId: study.id });

      const capabilityByLabel = new Map<string, string>();

      if (deck?.capabilities?.length) {
        for (const [i, label] of deck.capabilities.entries()) {
          const saved = await manager.save(
            manager.create(CaseStudyCapabilityEntity, {
              caseStudyId: study.id,
              label,
              position: i,
            }),
          );
          capabilityByLabel.set(label, saved.id);
        }
      }

      if (deck?.callouts?.length) {
        for (const [i, callout] of deck.callouts.entries()) {
          const capabilityId = capabilityByLabel.get(callout.label);

          /* A callout naming something not in the capability list would be a
             claim the study never made — skipped rather than invented. */
          if (!capabilityId) continue;

          await manager.save(
            manager.create(CaseStudyCalloutEntity, {
              caseStudyId: study.id,
              capabilityId,
              icon: callout.icon,
              x: String(callout.at.x),
              y: String(callout.at.y),
              position: i,
            }),
          );
        }
      }

      if (deck?.highlights?.length) {
        await manager.insert(
          CaseStudyHighlightEntity,
          deck.highlights.map((h, i) => ({
            caseStudyId: study.id,
            value: h.value,
            detail: h.detail,
            position: i,
          })),
        );
      }

      if (detail.stats.length) {
        await manager.insert(
          CaseStudyStatEntity,
          detail.stats.map((s, i) => ({
            caseStudyId: study.id,
            value: s.value,
            label: s.label,
            position: i,
          })),
        );
      }

      if (detail.meta.length) {
        await manager.insert(
          CaseStudyMetaRowEntity,
          detail.meta.map((m, i) => ({
            caseStudyId: study.id,
            label: m.label,
            value: m.value,
            position: i,
          })),
        );
      }

      const paragraphs = [
        ...detail.intro.map((text, i) => ({
          caseStudyId: study.id,
          kind: CaseStudyParagraphKind.INTRO,
          text,
          position: i,
        })),
        ...detail.results.map((text, i) => ({
          caseStudyId: study.id,
          kind: CaseStudyParagraphKind.RESULT,
          text,
          position: i,
        })),
      ];

      if (paragraphs.length) await manager.insert(CaseStudyParagraphEntity, paragraphs);

      if (detail.challenges.length) {
        await manager.insert(
          CaseStudyChallengeEntity,
          detail.challenges.map((c, i) => ({
            caseStudyId: study.id,
            title: c.title,
            challenge: c.challenge,
            solution: c.solution,
            position: i,
          })),
        );
      }

      for (const [i, shot] of detail.screenshots.entries()) {
        const mediaId = await media.importByPublicPath(
          shot.src,
          MediaPurpose.CASE_STUDY_CAPTURE,
          shot.alt,
        );

        /* A brief can reference a capture that was never supplied; the site
           already renders a placeholder frame for those. */
        if (!mediaId) continue;

        await manager.save(
          manager.create(CaseStudyScreenshotEntity, {
            caseStudyId: study.id,
            mediaId,
            fit: shot.fit === "contain" ? "contain" : "cover",
            lead: shot.lead ?? false,
            position: i,
          }),
        );
      }

      /* The industry link is read off the brief's own "Industry" meta row,
         exactly as the site derives it — so a project added to the briefs
         lands on its industry pages without a second curated list. */
      const industryRow = detail.meta.find((m) => m.label === "Industry");

      if (industryRow) {
        const names = industryRow.value.split("·").map((n) => n.trim().toLowerCase());
        const matched = names
          .map((n) => industryByName.get(n))
          .filter((i): i is IndustryEntity => Boolean(i));

        if (matched.length) {
          await manager
            .createQueryBuilder()
            .relation(CaseStudyEntity, "industries")
            .of(study.id)
            .addAndRemove(
              matched.map((m) => m.id),
              (
                await manager
                  .createQueryBuilder()
                  .relation(CaseStudyEntity, "industries")
                  .of(study.id)
                  .loadMany<IndustryEntity>()
              ).map((i) => i.id),
            );
        }
      }
    }

    log(`  case studies: ${studyBySlug.size} (${data.caseStudyDeck.length} featured on the deck)`);

    /* ----------------------------------------------------------- services */

    for (const [index, source] of data.services.entries()) {
      const service = await upsert(manager, ServiceEntity, { slug: source.slug }, {
        slug: source.slug,
        number: source.n,
        title: source.title,
        group: source.group === "gbs" ? ServiceGroup.GBS : ServiceGroup.TECH,
        phase: toPhase(source.phase),
        icon: source.icon,
        summary: source.summary,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
        seo: {
          title: null,
          description: null,
          ogImageId: null,
          canonicalUrl: null,
          noIndex: false,
        },
      });

      await manager.delete(ServiceSubEntity, { serviceId: service.id });

      if (source.subs.length) {
        await manager.insert(
          ServiceSubEntity,
          source.subs.map((sub, i) => ({
            serviceId: service.id,
            title: sub.title,
            description: sub.desc,
            position: i,
          })),
        );
      }

      /* Curated proof, strongest example first — the one link the site cannot
         derive, because the briefs describe deliverables rather than practices. */
      const workSlugs = data.serviceWork[source.slug] ?? [];
      const studyIds = workSlugs
        .map((slug) => studyBySlug.get(slug)?.id)
        .filter((id): id is string => Boolean(id));

      if (studyIds.length) {
        await manager
          .createQueryBuilder()
          .relation(ServiceEntity, "caseStudies")
          .of(service.id)
          .addAndRemove(
            studyIds,
            (
              await manager
                .createQueryBuilder()
                .relation(ServiceEntity, "caseStudies")
                .of(service.id)
                .loadMany<CaseStudyEntity>()
            ).map((c) => c.id),
          );
      }
    }

    log(`  services: ${data.services.length}`);

    /* ------------------------------------------------------------ offices */

    for (const [index, source] of data.offices.entries()) {
      const flagId = await media.importByPublicPath(
        source.flag,
        MediaPurpose.OFFICE_FLAG,
        `${source.country} flag`,
      );

      const slug = slugify(source.city);

      const office = await upsert(manager, OfficeEntity, { slug }, {
        slug,
        country: source.country,
        city: source.city,
        role: source.role,
        blurb: source.blurb,
        flagId,
        longitude: String(source.at.lon),
        latitude: String(source.at.lat),
        /* The Islamabad engineering centre is the largest site in the profile. */
        isHeadquarters: source.city === "Islamabad",
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });

      await manager.delete(OfficeAddressLineEntity, { officeId: office.id });

      if (source.address.length) {
        await manager.insert(
          OfficeAddressLineEntity,
          source.address.map((text, i) => ({ officeId: office.id, text, position: i })),
        );
      }
    }

    for (const [index, name] of data.deliveryCountries.entries()) {
      await upsert(manager, DeliveryCountryEntity, { name }, {
        name,
        code: COUNTRY_CODES[name] ?? name.slice(0, 2).toUpperCase(),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });
    }

    log(`  offices: ${data.offices.length}, delivery countries: ${data.deliveryCountries.length}`);

    /* -------------------------------------------------------------- posts */

    for (const [index, source] of data.posts.entries()) {
      const imageId = await media.importByPublicPath(
        source.image,
        MediaPurpose.POST_HERO,
        source.title,
      );

      await upsert(manager, PostEntity, { slug: source.slug }, {
        slug: source.slug,
        kind:
          source.kind === "News"
            ? PostKind.NEWS
            : source.kind === "Case Note"
              ? PostKind.CASE_NOTE
              : PostKind.BLOG,
        title: source.title,
        excerpt: source.excerpt,
        body: null,
        /* "Coming soon" is a rendering of a null date, not a stored string —
           these are article slots and no date is invented for them. */
        displayDate: null,
        imageId,
        externalUrl: source.href || null,
        featured: source.featured ?? false,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
        seo: {
          title: null,
          description: null,
          ogImageId: null,
          canonicalUrl: null,
          noIndex: false,
        },
      });
    }

    log(`  posts: ${data.posts.length}`);

    /* --------------------------------------------------------- leadership */

    for (const [index, source] of data.leaders.entries()) {
      const photoId = source.photo
        ? await media.importByPublicPath(
            source.photo,
            MediaPurpose.TEAM_PORTRAIT,
            `${source.name}, ${source.role}`,
          )
        : null;

      const slug = slugify(source.name);
      const role = source.role.toLowerCase();

      const leader = await upsert(manager, LeaderEntity, { slug }, {
        slug,
        name: source.name,
        role: source.role,
        initials: source.initials,
        photoId,
        bio: null,
        email: null,
        linkedinUrl: null,
        /* Read from the role line once, here, and stored as flags — the site
           then never has to string-match prose an editor can reword. */
        isFounder: role.includes("founder") && !role.includes("co-founder"),
        isCoFounder: role.includes("co-founder"),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });

      await manager.delete(LeaderPointEntity, { leaderId: leader.id });

      if (source.points.length) {
        await manager.insert(
          LeaderPointEntity,
          source.points.map((text, i) => ({ leaderId: leader.id, text, position: i })),
        );
      }
    }

    log(`  leadership: ${data.leaders.length}`);

    /* ------------------------------------------------------- testimonials */

    for (const [index, source] of data.testimonials.entries()) {
      /* The current avatars are pravatar URLs, not files in /public, so there
         is nothing to import — the card falls back to its monogram. */
      const avatarId = source.image?.startsWith("/")
        ? await media.importByPublicPath(
            source.image,
            MediaPurpose.TESTIMONIAL_AVATAR,
            source.author,
          )
        : null;

      await upsert(
        manager,
        TestimonialEntity,
        { author: source.author, company: source.company },
        {
          quote: source.quote,
          author: source.author,
          role: source.role,
          company: source.company,
          avatarId,
          /* Preserved as-is. These are sample quotes dressing the design, not
             approved endorsements, and the badge must stay on them. */
          pending: source.pending ?? true,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          position: index,
        },
      );
    }

    log(`  testimonials: ${data.testimonials.length} (all still flagged pending)`);

    /* ------------------------------------------------------------ clients */

    for (const [index, source] of data.clients.entries()) {
      const logoId = await media.importByPublicPath(
        `/clients/webp/${source.file}`,
        MediaPurpose.CLIENT_LOGO,
        `${source.name} logo`,
      );

      const slug = slugify(source.name);

      await upsert(manager, ClientEntity, { slug }, {
        slug,
        name: source.name,
        logoId,
        websiteUrl: null,
        isPartner: false,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });
    }

    log(`  clients: ${data.clients.length}`);

    /* -------------------------------------------------------------- stats */

    for (const [index, source] of data.stats.entries()) {
      const key = slugify(source.label).replace(/-/g, "_");

      await upsert(manager, StatEntity, { key }, {
        key,
        value: source.value,
        label: source.label,
        group: "about",
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });
    }

    /* ------------------------------------------------------------ socials */

    for (const [index, source] of data.socials.entries()) {
      await upsert(manager, SocialLinkEntity, { label: source.label }, {
        label: source.label,
        url: source.href,
        icon: source.icon,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        position: index,
      });
    }

    log(`  stats: ${data.stats.length}, social links: ${data.socials.length}`);
  });
}

/**
 * Finds a row by a natural key and updates it, or inserts it.
 *
 * Keyed on the content's own identity (a slug, a city, an author) rather than
 * on a generated id, which is what makes the seed re-runnable: the second run
 * converges on the same rows instead of creating a parallel set.
 */
async function upsert<T extends object>(
  manager: EntityManager,
  entity: new () => T,
  where: Partial<T>,
  values: Partial<T>,
): Promise<T & { id: string }> {
  const repo = manager.getRepository(entity);

  const existing = (await repo.findOne({ where: where as never })) as (T & { id: string }) | null;

  if (existing) {
    Object.assign(existing, values);
    return (await repo.save(existing as never)) as T & { id: string };
  }

  return (await repo.save(repo.create(values as never) as never)) as T & { id: string };
}
