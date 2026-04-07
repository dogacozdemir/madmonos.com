export type MadInsight = {
  id: string;
  image: string;
  date: string;
  category: string;
  title: string;
};

export const MAD_INSIGHTS: readonly MadInsight[] = [
  {
    id: "1",
    image: "/assets/insight-madmonos.webp",
    date: "Mar 2026",
    category: "GEO",
    title: "Generative search is the new SERP — briefs that win in Perplexity & SearchGPT",
  },
  {
    id: "2",
    image: "/assets/insight-madmonos-text.webp",
    date: "Feb 2026",
    category: "Creative",
    title: "4K campaign systems: when luxury needs volume without watering the brand",
  },
  {
    id: "3",
    image: "/assets/insight-madmonos.webp",
    date: "Jan 2026",
    category: "MarTech",
    title: "Stack glue that survives the quarter — routing, reporting, and human-readable automation",
  },
] as const;
