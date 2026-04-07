/**
 * Digital Present–style project rails (60% cards / 40% sticky rail).
 * `width` / `height`: kaynak dosyanın gerçek piksel boyutu (`next/image` doğal ölçü).
 * `sizes` — `sticky-solutions.tsx` içinde.
 */
export type ProjectSlide = {
  id: string;
  clientCode: string;
  title: string;
  description: string;
  image: string;
  /** Kaynak görselin piksel genişliği */
  width: number;
  /** Kaynak görselin piksel yüksekliği */
  height: number;
  imageAlt: string;
  tone: string;
  technicalBadge?: string;
};

export const DIGITAL_PRESENT_PROJECTS: readonly ProjectSlide[] = [
  {
    id: "01",
    clientCode: "CREATIVE ENGINE",
    title: "High-Volume Gen-AI Assets",
    description:
      "4K-grade AI social and ad creatives with custom HTML5 templates and automated brand identity systems.",
    image: "/assets/creative-gen.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos AI creative hub — dynamic 4K product visuals and HTML5 assets emerging from a golden neural grid",
    tone: "from-mad-gold/30 via-mad-deep to-mad-base",
    technicalBadge: "AI · Creative",
  },
  {
    id: "02",
    clientCode: "SEARCH DOMINATION",
    title: "Technical SEO & GEO",
    description:
      "Rebuilding digital architectures for the LLM era — dominating Perplexity, SearchGPT, and classic search through technical authority.",
    image: "/assets/geo-search.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos GEO architecture — LLM-optimized data streams and technical SEO nodes in a cinematic obsidian interface",
    tone: "from-mad-accent/35 via-mad-deep to-mad-base",
    technicalBadge: "GEO · LLM",
  },
  {
    id: "03",
    clientCode: "GROWTH ARCHITECT",
    title: "Performance & Media Buying",
    description:
      "Aggressive media buying across Meta, Google, and TikTok with real-time spend optimization and retargeting ecosystems.",
    image: "/assets/performance-ads.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos performance dashboard — cross-platform ad metrics and liquid gold data flows for Meta and Google Ads",
    tone: "from-mad-highlight/25 via-mad-deep to-mad-base",
    technicalBadge: "Ads · Growth",
  },
  {
    id: "04",
    clientCode: "LOGIC STACK",
    title: "Ecosystem Automation",
    description:
      "Full-spectrum automation and integration of CRM, CDP, and ERP systems into unified, frictionless marketing workflows.",
    image: "/assets/tech-automation.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos technical integration — mechanical gold circuit traces connecting complex CRM and ERP software nodes",
    tone: "from-mad-gold-dark/25 via-mad-deep to-mad-base",
    technicalBadge: "Stack · Automation",
  },
  {
    id: "05",
    clientCode: "OPS COMMAND",
    title: "Real-Time Operational Hub",
    description:
      "Frictionless campaign and social management delivered through custom web and mobile dashboards for 24/7 transparency.",
    image: "/assets/ops-dashboard.webp",
    width: 520,
    height: 292,
    imageAlt:
      "Madmonos operational control — real-time reporting dashboard with transparent data flows and account metrics",
    tone: "from-mad-accent/20 via-mad-deep to-mad-base",
    technicalBadge: "Ops · Data",
  },
] as const;
