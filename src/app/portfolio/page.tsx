import type { Metadata } from "next";
import { MescubookPortfolio } from "@/components/portfolio/mescubook-portfolio";
import { getSortedPortfolioProjects } from "@/lib/blog-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Scroll-driven portfolio filmstrip — AI creative, GEO, performance media, automation, and ops dashboards from madmonos.";

export const metadata: Metadata = {
  title: "Portfolio",
  description,
  alternates: {
    canonical: `${SITE_URL}/portfolio`,
  },
  openGraph: {
    title: `Portfolio | ${SITE_NAME}`,
    description,
    url: `${SITE_URL}/portfolio`,
    type: "website",
  },
};

export const dynamic = "force-static";

export default async function PortfolioPage() {
  const projects = await getSortedPortfolioProjects("default");

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} portfolio`,
    description,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      description: p.description,
      image: `${SITE_URL}${p.image.startsWith("/") ? p.image : `/${p.image}`}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <MescubookPortfolio projects={projects} />
    </>
  );
}
