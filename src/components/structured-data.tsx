import { DIGITAL_PRESENT_PROJECTS } from "@/data/digital-present-projects";
import { MAD_STICKY_SLIDES } from "@/data/mad-genius-copy";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SITE_OG_IMAGE,
  getOrgSameAs,
} from "@/lib/site";

const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const serviceUri = (slideId: string) => `${SITE_URL}/#service-${slideId}`;

/** GEO / erişilebilirlik: görünmez HTML ile JSON-LD ile aynı SSS (bots + AT). */
const GEO_FAQ_ENTRIES = [
  {
    name: "What does Madmonos do?",
    text: SITE_DESCRIPTION,
  },
  {
    name: "What are Madmonos' four service pillars?",
    text: "Creative: scalable AI-enhanced design, video, social and ad creatives, brand identity, product visuals, email and HTML5. Performance: data-driven media buying on Meta, Google, TikTok, retargeting and spend optimization. Operations: campaign and social management, real-time dashboards, and account ops. Technical: web and mobile development, SEO and GEO, CRM/CDP/ERP integrations, and marketing automation.",
  },
  {
    name: "What is Generative Engine Optimization (GEO)?",
    text: "GEO is the practice of structuring brand content, metadata, and structured data so large language models and AI search systems (for example Perplexity and SearchGPT-class surfaces) can accurately represent your positioning, services, and proof points alongside classic search.",
  },
  {
    name: "How does Madmonos reduce client friction?",
    text: "We automate repetitive marketing work, integrate CRM, CDP, and ERP into unified workflows, and replace static reporting with custom web and mobile dashboards so teams see real-time performance and ROI.",
  },
  {
    name: "How can teams contact Madmonos?",
    text: "Email hello@madmonos.com for new business, partnerships, or project inquiries.",
  },
  {
    name: "What proof of work does Madmonos publish on its homepage?",
    text: "The homepage features an ItemList of featured capability lines with Project and CreativeWork nodes, each linked to the Organization as creator and to Service lines, for machine-readable context for humans and AI systems.",
  },
] as const;

/** Featured case ↔ primary sticky service line (ItemList services use slide `id`). */
const PROJECT_PRIMARY_SERVICE_SLIDE: Readonly<Record<string, string>> = {
  "01": "01",
  "02": "02",
  "03": "02",
  "04": "05",
  "05": "04",
};

function subjectOfForServiceSlide(
  slideId: string
): readonly { "@id": string }[] {
  return DIGITAL_PRESENT_PROJECTS.filter(
    (p) => PROJECT_PRIMARY_SERVICE_SLIDE[p.id] === slideId
  ).map((p) => ({ "@id": `${SITE_URL}/#project-${p.id}` }));
}

type ImageObjectLd = {
  "@type": "ImageObject";
  url: string;
  caption?: string;
};

type ContactPointLd = {
  "@type": "ContactPoint";
  contactType: string;
  email: string;
  areaServed: string;
  availableLanguage: readonly string[];
};

type OrganizationLd = {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: ImageObjectLd;
  description: string;
  slogan: string;
  areaServed: string;
  knowsAbout: readonly string[];
  contactPoint?: readonly ContactPointLd[];
  sameAs?: readonly string[];
};

type FAQPageLd = {
  "@type": "FAQPage";
  "@id": string;
  mainEntity: readonly {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
};

type WebSiteLd = {
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  publisher: { "@id": string };
  description: string;
};

type WebPageLd = {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description: string;
  isPartOf: { "@id": string };
  about: { "@id": string };
  primaryImageOfPage: ImageObjectLd;
};

type BreadcrumbListLd = {
  "@type": "BreadcrumbList";
  "@id": string;
  itemListElement: readonly {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

type ServiceListItemLd = {
  "@type": "ListItem";
  position: number;
  item: {
    "@type": "Service";
    "@id": string;
    name: string;
    description: string;
    provider: { "@id": string };
    serviceType: string;
    about: { "@id": string };
    subjectOf?: readonly { "@id": string }[];
  };
};

type ItemListServicesLd = {
  "@type": "ItemList";
  "@id": string;
  name: string;
  numberOfItems: number;
  itemListElement: ServiceListItemLd[];
};

type ItemListProjectsLd = {
  "@type": "ItemList";
  "@id": string;
  name: string;
  numberOfItems: number;
  itemListElement: readonly {
    "@type": "ListItem";
    position: number;
    item: { "@id": string };
  }[];
};

type ProjectCreativeLd = {
  "@type": readonly ["Project", "CreativeWork"];
  "@id": string;
  url: string;
  name: string;
  description: string;
  abstract: string;
  disambiguatingDescription: string;
  image: ImageObjectLd;
  creator: { "@id": string };
  keywords: string;
  about: readonly { "@id": string }[];
  isBasedOn: readonly { "@id": string }[];
};

type JsonLdGraph = readonly (
  | OrganizationLd
  | WebSiteLd
  | WebPageLd
  | FAQPageLd
  | BreadcrumbListLd
  | ItemListServicesLd
  | ItemListProjectsLd
  | ProjectCreativeLd
)[];

type JsonLdPayload = {
  "@context": "https://schema.org";
  "@graph": JsonLdGraph;
};

/**
 * JSON-LD 2.0: Organization, WebSite, WebPage, BreadcrumbList, services, featured projects.
 */
export function StructuredData() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${SITE_URL}/#webpage`;
  const orgSameAs = getOrgSameAs();

  const projectNodes: ProjectCreativeLd[] = DIGITAL_PRESENT_PROJECTS.map((p) => {
    const slideId = PROJECT_PRIMARY_SERVICE_SLIDE[p.id] ?? "01";
    const svc = serviceUri(slideId);
    return {
      "@type": ["Project", "CreativeWork"] as const,
      "@id": `${SITE_URL}/#project-${p.id}`,
      url: `${SITE_URL}/#project-${p.id}`,
      name: `${p.clientCode}: ${p.title}`,
      description: `${p.description} — ${p.imageAlt}`,
      abstract: p.imageAlt,
      disambiguatingDescription: p.description,
      image: {
        "@type": "ImageObject",
        url: absoluteUrl(p.image),
        caption: p.imageAlt,
      },
      creator: { "@id": organizationId },
      keywords: p.technicalBadge ?? p.clientCode,
      about: [{ "@id": organizationId }, { "@id": svc }],
      isBasedOn: [{ "@id": svc }],
    };
  });

  const orgNode = {
    "@type": "Organization" as const,
    "@id": organizationId,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject" as const,
      url: SITE_OG_IMAGE,
      caption: "Madmonos low-poly gorilla mark and wordmark",
    },
    description: SITE_DESCRIPTION,
    slogan: "End-to-end marketing, accelerated by AI.",
    areaServed: "Worldwide",
    knowsAbout: [
      "Generative Engine Optimization",
      "Technical SEO and GEO",
      "Meta Ads and Google Ads",
      "TikTok Ads and retargeting",
      "AI creative and HTML5 assets",
      "Brand identity and product visuals",
      "CRM CDP and ERP integrations",
      "Marketing automation and workflows",
      "Real-time dashboards and reporting",
      "AI avatars and video production",
      "Go-to-market acceleration",
      "MarTech integration",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "hello@madmonos.com",
        areaServed: "Worldwide",
        availableLanguage: ["English", "Turkish"],
      },
    ],
    ...(orgSameAs.length > 0 ? { sameAs: orgSameAs } : {}),
  } satisfies OrganizationLd;

  const graph = [
    orgNode,
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": organizationId },
      description: SITE_DESCRIPTION,
    } satisfies WebSiteLd,
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: SITE_URL,
      name: `${SITE_NAME} — Home`,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: SITE_OG_IMAGE,
        caption: "Madmonos brand mark",
      },
    } satisfies WebPageLd,
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: GEO_FAQ_ENTRIES.map((item) => ({
        "@type": "Question" as const,
        name: item.name,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: item.text,
        },
      })),
    } satisfies FAQPageLd,
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
      ],
    } satisfies BreadcrumbListLd,
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#services`,
      name: "Madmonos core service lines",
      numberOfItems: MAD_STICKY_SLIDES.length,
      itemListElement: MAD_STICKY_SLIDES.map((s, i) => {
        const subjectOf = subjectOfForServiceSlide(s.id);
        return {
          "@type": "ListItem" as const,
          position: i + 1,
          item: {
            "@type": "Service" as const,
            "@id": serviceUri(s.id),
            name: `${s.stage} — ${s.title}`,
            description: `${s.tagline} ${s.description}`,
            provider: { "@id": organizationId },
            serviceType: s.stage,
            about: { "@id": organizationId },
            ...(subjectOf.length > 0 ? { subjectOf } : {}),
          },
        };
      }),
    } satisfies ItemListServicesLd,
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#featured-projects`,
      name: "Featured client work — digital solutions & GTM systems",
      numberOfItems: DIGITAL_PRESENT_PROJECTS.length,
      itemListElement: DIGITAL_PRESENT_PROJECTS.map((p, i) => ({
        "@type": "ListItem" as const,
        position: i + 1,
        item: { "@id": `${SITE_URL}/#project-${p.id}` },
      })),
    } satisfies ItemListProjectsLd,
    ...projectNodes,
  ] as const satisfies JsonLdGraph;

  const payload: JsonLdPayload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
      />
      <section
        className="sr-only"
        aria-label="Madmonos organization summary and frequently asked questions"
        aria-hidden={false}
      >
        <h2>{SITE_NAME}</h2>
        <p>{SITE_DESCRIPTION}</p>
        <p>
          Slogan: End-to-end marketing, accelerated by AI. Contact: hello@madmonos.com. Area
          served: Worldwide.
        </p>
        <h3>Frequently asked questions</h3>
        <dl>
          {GEO_FAQ_ENTRIES.map((item) => (
            <div key={item.name}>
              <dt>{item.name}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
