import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* The two real, indexable routes. When more pages (or per-case-study routes)
   land, add them here — this is the crawl map Google reads first. */
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
      url: `${SITE_URL}/case-studies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
