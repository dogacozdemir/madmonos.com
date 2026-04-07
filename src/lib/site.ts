export const SITE_NAME = "madmonos";

/** Canonical URL for JSON-LD and Open Graph — override via env in production. */
export const SITE_URL =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL) ||
  "https://madmonos.com";

/** Aligned with brand playbook: AI-first, end-to-end growth, engineering + creative + ops. */
export const SITE_DESCRIPTION =
  "Madmonos is an AI-first marketing agency delivering frictionless, end-to-end growth. We combine elite technical engineering with full-spectrum performance marketing, SEO-GEO, and operations — from AI creative and HTML5 assets to Meta, Google, and TikTok media buying, custom dashboards, and CRM/CDP/ERP integrations.";

export const SITE_OG_IMAGE = `${SITE_URL}/madmonos.webp`;

/** Comma- or space-separated profile URLs for JSON-LD `sameAs` (optional). */
export function getOrgSameAs(): readonly string[] {
  const raw = process.env.NEXT_PUBLIC_ORG_SAME_AS;
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((u) => u.startsWith("http"));
}
