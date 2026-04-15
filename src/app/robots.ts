import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Explicit allow rules for major AI crawlers.
 * Ensures GPTBot, Claude-Web, PerplexityBot, and Google AI all index
 * the site for GEO (Generative Engine Optimization) coverage.
 */
export default function robots(): MetadataRoute.Robots {
  const allow = "/";
  return {
    rules: [
      { userAgent: "*", allow },
      // AI search crawlers — explicitly permitted for GEO coverage
      { userAgent: "GPTBot", allow },
      { userAgent: "ChatGPT-User", allow },
      { userAgent: "OAI-SearchBot", allow },
      { userAgent: "Claude-Web", allow },
      { userAgent: "anthropic-ai", allow },
      { userAgent: "PerplexityBot", allow },
      { userAgent: "cohere-ai", allow },
      { userAgent: "Googlebot", allow },
      { userAgent: "Google-Extended", allow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
