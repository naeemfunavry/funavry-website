import {
  getDeliveryCountries,
  getIndustries,
  getOffices,
  getServices,
  getSocials,
} from "./api";

/**
 * The data the page chrome needs — the nav's mega-menu and the footer.
 *
 * Every page renders both, so every page would otherwise repeat the same five
 * fetches and the same Promise.all. Fetched in parallel; each response is
 * cached under its own tag, so the five requests collapse to zero on a warm
 * page and only the tag that actually changed is purged on a publish.
 */
export async function getChrome() {
  const [services, industries, offices, deliveryCountries, socials] = await Promise.all([
    getServices(),
    getIndustries(),
    getOffices(),
    getDeliveryCountries(),
    getSocials(),
  ]);

  return { services, industries, offices, deliveryCountries, socials };
}

export type Chrome = Awaited<ReturnType<typeof getChrome>>;
