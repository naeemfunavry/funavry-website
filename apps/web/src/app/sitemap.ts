import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCaseStudySlugs, getIndustries, getServices } from "@/lib/api";

/* The indexable routes — this is the crawl map Google reads first.
   Async now that the routes come from the CMS: publishing a case study adds it
   to the sitemap on the next revalidation rather than on the next deploy. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, industries, caseStudySlugs] = await Promise.all([
    getServices(),
    getIndustries(),
    getCaseStudySlugs(),
  ]);

  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/industries`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    ...services.map(({ slug }) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...industries.map(({ slug }) => ({
      url: `${SITE_URL}/industries/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...caseStudySlugs.map((slug) => ({
      url: `${SITE_URL}/case-studies/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
