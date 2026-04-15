import type { Metadata } from "next";
import { MarForStrategyContent } from "@/components/marfor/marfor-strategy-content";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const MARFOR_DESCRIPTION =
  "The MarFor Strategy — Marketing Forces across Performance, Creative, Operations, and Technical. Engineering capacity and frictionless growth by madmonos.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${SITE_URL}/marfor`;
  return {
    title: "MarFor Strategy",
    description: MARFOR_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: `MarFor Strategy | ${SITE_NAME}`,
      description: MARFOR_DESCRIPTION,
      images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} MarFor` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `MarFor Strategy | ${SITE_NAME}`,
      description: MARFOR_DESCRIPTION,
      images: [SITE_OG_IMAGE],
    },
  };
}

export default function MarForPage() {
  return <MarForStrategyContent />;
}
