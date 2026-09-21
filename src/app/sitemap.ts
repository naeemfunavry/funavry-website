import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { CASE_STUDY_DETAILS } from "@/lib/case-study-details";
import { INDUSTRIES } from "@/lib/industries";
import { SERVICES } from "@/lib/services";

/* The indexable routes — this is the crawl map Google reads first. */
export default function sitemap(): MetadataRoute.Sitemap {
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
    // {
    //   url: `${SITE_URL}/blog`,
    //   lastModified,
    //   changeFrequency: "weekly",
    //   priority: 0.6,
    // },
    ...SERVICES.map(({ slug }) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...INDUSTRIES.map(({ slug }) => ({
      url: `${SITE_URL}/industries/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CASE_STUDY_DETAILS.map(({ slug }) => ({
      url: `${SITE_URL}/case-studies/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
