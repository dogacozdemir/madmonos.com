/**
 * Digital Present–style project rails (60% cards / 40% sticky rail).
 * `width` / `height`: kaynak dosyanın gerçek piksel boyutu (`next/image` doğal ölçü).
 * `sizes` — `sticky-solutions.tsx` içinde.
 */
export type ProjectSlide = {
  id: string;
  clientCode: string;
  title: string;
  /** List / year rail (HUD) */
  year: string;
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
    clientCode: "ELITE VIDEO",
    title: "AI Creative",
    year: "2026",
    description:
      "Cinema-grade AI video synthesis. High-emotion, brand-perfect engineered content.",
    image: "/assets/creative-gen.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos Elite Video — Cinema-grade AI production and liquid-gold visual synthesis for high-end brand storytelling",
    tone: "from-mad-gold/30 via-mad-deep to-mad-base",
    technicalBadge: "Cinema-AI · Production",
  },
  {
    id: "02",
    clientCode: "MARFOR HOUSE",
    title: "Marfor Strategy",
    year: "2025",
    description:
      "Enter Marfor: our marketing force with elite digital architecture. ",
    image: "/assets/geo-search.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos Marfor House — Enterprise-level marketing architecture and high-authority strategy nodes in a cinematic interface",
    tone: "from-mad-accent/35 via-mad-deep to-mad-base",
    technicalBadge: "Marfor · Enterprise",
  },
  {
    id: "03",
    clientCode: "UNIFIED FLOW",
    title: "Growth Engine",
    year: "2024",
    description:
      "Creative, performance, and ops - a unified growth engine.",
    image: "/assets/performance-ads.webp",
    width: 520,
    height: 290,
    imageAlt:
      "Madmonos Unified Flow — Integration of creative, performance, and operations into a single frictionless neural growth engine",
    tone: "from-mad-highlight/25 via-mad-deep to-mad-base",
    technicalBadge: "Full-Stack · Growth",
  },
] as const;
