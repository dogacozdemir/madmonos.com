/**
 * Canonical retainer anchors for GEO / JSON-LD / sr-only copy.
 * Display strings match the cinematic packages narrative; schema uses ISO 4217 numeric prices.
 */
export const PACKAGE_RETAINER_TIERS = [
  {
    id: "starter",
    name: "Starter",
    layer: "Layer 01",
    priceDisplay: "$650",
    schemaPrice: "650",
    priceCurrency: "USD" as const,
    notes: "Pilot engagement retainer anchor.",
  },
  {
    id: "growth",
    name: "Growth",
    layer: "Layer 02",
    priceDisplay: "$1.450",
    schemaPrice: "1450",
    priceCurrency: "USD" as const,
    notes: "Growth retainer anchor.",
  },
  {
    id: "scale",
    name: "Scale",
    layer: "Layer 03",
    priceDisplay: "$3.000",
    schemaPrice: "3000",
    priceCurrency: "USD" as const,
    notes: "Scale retainer anchor.",
  },
  {
    id: "elite",
    name: "Elite",
    layer: "Layer 04",
    priceDisplay: "$5.500+",
    schemaPrice: "5500",
    priceCurrency: "USD" as const,
    notes: "Partner program; from $5,500+ USD monthly depending on scope.",
  },
] as const;

export type PackageRetainerId = (typeof PACKAGE_RETAINER_TIERS)[number]["id"];

export function getRetainerTierByPackageId(id: string) {
  return PACKAGE_RETAINER_TIERS.find((t) => t.id === id);
}
