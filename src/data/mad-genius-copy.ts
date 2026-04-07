/**
 * Sticky Solutions narrative — “Mad Genius” vs Slow GTM.
 * Visual keys (legacy horizontal stack); see `services-character-stack` / horizontal services.
 */
export type StickyVisualId =
  | "ai-creative-particles"
  | "growth-channel-grid"
  | "geo-georilla"
  | "martech-autorilla"
  | "engineering-codewhisper"
  | "marketing-bento"
  | "automation-flows";

export type MadStickySlide = {
  id: string;
  stage: string;
  title: string;
  tagline: string;
  /** Short line under title in sticky column */
  description: string;
  visual: StickyVisualId;
  tone: string;
  /** Optional floating badge on visual (desktop / hero of panel) */
  technicalBadge?: string;
};

export const MAD_STICKY_SLIDES: readonly MadStickySlide[] = [
  {
    id: "01",
    stage: "AI Creative",
    title: "AI Creative",
    tagline: "Visual Chaos, Engineered.",
    description: "Cinema-grade output without the production bottleneck.",
    visual: "ai-creative-particles",
    tone: "from-mad-gold/30 via-mad-deep to-mad-base",
    technicalBadge: "4K / 60FPS / AI-Rendered",
  },
  {
    id: "02",
    stage: "Growth Strategy",
    title: "Growth Strategy",
    tagline: "Systems Over Ideas.",
    description: "One spine across channels — measurable, repeatable, owned.",
    visual: "growth-channel-grid",
    tone: "from-mad-accent/35 via-mad-deep to-mad-base",
  },
  {
    id: "03",
    stage: "Engineering",
    title: "Engineering",
    tagline: "Architecture for Speed.",
    description: "Ship safe. Ship fast. Document what runs in prod.",
    visual: "engineering-codewhisper",
    tone: "from-mad-highlight/25 via-mad-deep to-mad-base",
  },
  {
    id: "04",
    stage: "Marketing Office",
    title: "Marketing Office",
    tagline: "Your External Brain.",
    description: "MarTech under one roof — strategy, ops, and stack truth.",
    visual: "marketing-bento",
    tone: "from-mad-gold-dark/25 via-mad-deep to-mad-base",
  },
  {
    id: "05",
    stage: "Automation",
    title: "Automation",
    tagline: "Human-Free Efficiency.",
    description: "Reporting, stock, tasks — wired so people decide, not copy-paste.",
    visual: "automation-flows",
    tone: "from-mad-accent/28 via-mad-deep to-mad-base",
  },
] as const;

/** Horizontal “morphing services” rail — titles + editorial one-liners. */
export type MorphingServiceItem = {
  id: string;
  title: string;
  description: string;
};

export const MORPHING_SERVICES: readonly MorphingServiceItem[] = [
  {
    id: "ai-creative",
    title: "AI creative",
    description: "Building fast — cinematic spots, stills, and variants without the production queue.",
  },
  {
    id: "web-dev",
    title: "Web dev",
    description: "Scaling smarter — performant surfaces, contracts, and deploys you can trust.",
  },
  {
    id: "automation",
    title: "Automation",
    description: "Pipelines that run while your team decides — not while they copy-paste.",
  },
  {
    id: "seo-geo",
    title: "SEO / GEO",
    description: "Discovery that compounds — classic search plus AI-native surfaces.",
  },
  {
    id: "strategy",
    title: "Strategy",
    description: "One spine across GTM — measurable, owned, ready to ship.",
  },
] as const;
