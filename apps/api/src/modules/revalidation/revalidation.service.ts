import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";

import { appConfig } from "src/config/configuration";

/**
 * Cache tags. Each names a slice of the public site's data, and a page opts
 * into the ones it renders from. Invalidating a tag re-renders every page that
 * declared it — which is why a case study edit does not have to know that the
 * home deck, the /case-studies index, two industry pages and a service page all
 * show it.
 */
export const CacheTag = {
  CASE_STUDIES: "case-studies",
  SERVICES: "services",
  INDUSTRIES: "industries",
  POSTS: "posts",
  LEADERS: "leaders",
  TEAM: "team",
  OFFICES: "offices",
  CLIENTS: "clients",
  TESTIMONIALS: "testimonials",
  TECHNOLOGIES: "technologies",
  STATS: "stats",
  SOCIALS: "socials",
  SETTINGS: "settings",
} as const;

export type CacheTagValue = (typeof CacheTag)[keyof typeof CacheTag];

/**
 * Tells the public Next site to re-render.
 *
 * Called after every write, which is what makes the admin panel feel connected
 * to the live site rather than to a database the site happens to read hourly.
 *
 * Deliberately best-effort. A failed revalidation must not fail the write the
 * editor already committed — the content is correct, the cache is merely stale,
 * and the next scheduled revalidation or deploy will settle it. The failure is
 * logged at warn so a persistently unreachable web app is visible.
 */
@Injectable()
export class RevalidationService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RevalidationService.name);
  }

  /**
   * Invalidates one or more tags, and optionally specific paths.
   *
   * Paths are for the cases a tag cannot express — a slug change has to purge
   * the *old* URL, which no tag on the new row knows about.
   */
  async revalidate(tags: CacheTagValue[], paths: string[] = []): Promise<boolean> {
    const endpoint = `${this.config.webAppUrl.replace(/\/$/, "")}/api/revalidate`;

    try {
      /* Timed out rather than left hanging: this runs inside the request that
         performed the write, and a wedged web app must not hold that open. */
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          /* A shared secret in a header, not a query parameter — query strings
             end up in access logs, browser history and referrer headers. */
          "x-revalidate-secret": this.config.revalidateSecret,
        },
        body: JSON.stringify({ tags, paths }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        this.logger.warn(
          { status: response.status, tags, paths },
          "Revalidation request was rejected by the web app",
        );
        return false;
      }

      this.logger.debug({ tags, paths }, "Revalidated public site");
      return true;
    } catch (err) {
      this.logger.warn({ err, tags, paths }, "Revalidation request failed");
      return false;
    }
  }
}
