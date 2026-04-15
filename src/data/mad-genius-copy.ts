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
  id: MorphingServiceId;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  technicalBadge?: string;
};

export type MorphingServiceId =
  | "ai-creative"
  | "tech-stack"
  | "automation"
  | "performance"
  | "growth-architecture";

export const MORPHING_SERVICES: readonly MorphingServiceItem[] = [
  {
    id: "ai-creative",
    title: "AI creative",
    description: "Building fast — cinematic spots, stills, and variants that fits your branding",
    image: "/creative.webp",
    imageAlt:
      "AI creative service visual for cinematic brand assets, ad variants, and social content generation",
  },
  {
    id: "tech-stack",
    title: "Tech stack",
    description: "From web development to technical SEO/GEO, we handle all your technical burden.",
    image: "/developer.webp",
    imageAlt:
      "Technical stack service visual covering web development, technical SEO, and GEO implementation",
  },
  {
    id: "automation",
    title: "Brand Mono",
    description:
      "The face of your business. A dedicated AI persona ensuring your brand stays active when your team doesn't want to be on camera.",
    image: "/agent.webp",
    imageAlt:
      "Madmonos Brand Mono — A high-fidelity AI brand ambassador engineered for continuous cinematic content production",
    technicalBadge: "AI Avatar · Content",
  },
  {
    id: "performance",
    title: "Performance",
    description: "We manage the most consistent and suitable campaigns for you across all social media and advertising platforms.",
    image: "/performance.webp",
    imageAlt:
      "Performance marketing service visual for multi-channel campaign execution and optimization",
  },
  {
    id: "growth-architecture",
    title: "Growth Architecture",
    description:
      "Growth isn't a plan; it's a blueprint. We engineer the the possible best practices for your business.",
    image: "/strategy.webp",
    imageAlt:
      "Madmonos Growth Architecture — High-velocity GTM blueprints and neural strategy nodes engineered for scalable market entry",
    technicalBadge: "Logic · GTM",
  },
] as const;
