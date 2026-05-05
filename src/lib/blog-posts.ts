import { cache } from "react";
import { SITE_LOGO_URL, SITE_URL } from "@/lib/site";

const BLOG_SHEET_ID = "13voX8UVu55bYIK8jpHHk_EfoVpto4e5niKpWUkliiHM";
const DEFAULT_SHEET_GID = "0";

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string;
  faqs: BlogFaq[];
  entities: string[];
  publishedAt: string | null;
};

type BlogPostingJsonLd = {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  mainEntityOfPage: string;
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author: { "@type": "Organization"; name: string; url: string };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  keywords?: string;
};

type SheetCell = {
  v?: string | number | null;
  f?: string;
};

type SheetRow = {
  c: Array<SheetCell | null>;
};

type SheetTable = {
  cols: Array<{ label: string }>;
  rows: SheetRow[];
};

type GvizPayload = {
  table?: SheetTable;
};

const toKey = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const asText = (cell: SheetCell | null | undefined) => {
  if (!cell) return "";
  if (typeof cell.f === "string" && cell.f.trim()) return cell.f.trim();
  if (typeof cell.v === "string") return cell.v.trim();
  if (typeof cell.v === "number") return String(cell.v);
  return "";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const FALLBACK_COVER_IMAGE = "/logo-nav.webp";

function parseEntities(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Fallback: comma-separated plain text.
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFaqs(raw: string): BlogFaq[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const question =
            "question" in item && typeof item.question === "string" ? item.question.trim() : "";
          const answer = "answer" in item && typeof item.answer === "string" ? item.answer.trim() : "";
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is BlogFaq => item !== null);
    }
  } catch {
    // Fallback format: "Question::Answer||Question2::Answer2"
  }

  return trimmed
    .split("||")
    .map((entry) => {
      const [question = "", answer = ""] = entry.split("::");
      const q = question.trim();
      const a = answer.trim();
      if (!q || !a) return null;
      return { question: q, answer: a };
    })
    .filter((item): item is BlogFaq => item !== null);
}

function parseMarkdownInline(line: string): string {
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function markdownToHtml(markdown: string): string {
  const safeMarkdown = typeof markdown === "string" ? markdown : "";
  const lines = safeMarkdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      blocks.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      blocks.push(`<h4>${parseMarkdownInline(line.slice(4).trim())}</h4>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      blocks.push(`<h3>${parseMarkdownInline(line.slice(3).trim())}</h3>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      blocks.push(`<h2>${parseMarkdownInline(line.slice(2).trim())}</h2>`);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        blocks.push("<ul>");
        inList = true;
      }
      blocks.push(`<li>${parseMarkdownInline(line.slice(2).trim())}</li>`);
      continue;
    }

    closeList();
    blocks.push(`<p>${parseMarkdownInline(line.trim())}</p>`);
  }

  closeList();
  return blocks.join("\n");
}

function normalizeSheetPost(entry: Record<string, string>): BlogPost | null {
  const title = entry.title?.trim() ?? "";
  const category = entry.category?.trim() ?? "";
  const excerpt = entry.excerpt?.trim() ?? "";
  const content = entry.content?.trim() ?? "";
  if (!title) return null;

  const slug = slugify(entry.slug?.trim() || title);
  if (!slug) return null;

  const coverImage = entry.cover_image?.trim() || FALLBACK_COVER_IMAGE;
  const publishedAt = entry.published_at?.trim() || null;
  const faqsRaw = entry.faq_json?.trim() || entry.faqs?.trim() || "";
  const entitiesRaw = entry.entities?.trim() || "";

  return {
    slug,
    title,
    category: category || "General",
    excerpt: excerpt || "Excerpt not provided yet.",
    content: content || "Content is being prepared. Please check back soon.",
    coverImage,
    coverAlt: entry.cover_alt?.trim() || `${title} cover image`,
    faqs: parseFaqs(faqsRaw),
    entities: parseEntities(entitiesRaw),
    publishedAt,
  };
}

async function fetchSheetRows(): Promise<Record<string, string>[]> {
  const gid = process.env.BLOG_SHEET_GID?.trim() || DEFAULT_SHEET_GID;
  const url = `https://docs.google.com/spreadsheets/d/${BLOG_SHEET_ID}/gviz/tq?tqx=out:json&gid=${encodeURIComponent(gid)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("blog-sheet-timeout"), 10_000);
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch blog data: ${response.status}`);
  }

  const text = await response.text();

  const setResponseMatch = text.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/
  );
  const jsonText = setResponseMatch?.[1]?.trim() || "";
  if (!jsonText) {
    throw new Error("Invalid Google Sheet response format.");
  }

  const payload = JSON.parse(jsonText) as GvizPayload;
  const table = payload.table;
  if (!table) return [];

  const labelHeaders = table.cols.map((col) => toKey(col.label || ""));
  const hasUsableLabels = labelHeaders.some(Boolean);
  const rows = table.rows ?? [];
  if (rows.length === 0) return [];

  // Some Google Sheets return empty `cols[].label` and place headers in first row.
  const fallbackHeaders = (rows[0]?.c ?? []).map((cell) => toKey(asText(cell)));
  const headers = hasUsableLabels ? labelHeaders : fallbackHeaders;
  const dataRows = hasUsableLabels ? rows : rows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((key, idx) => {
      if (!key) return;
      record[key] = asText(row.c[idx]);
    });
    return record;
  });
}

const getBlogPostsCached = cache(async (): Promise<BlogPost[]> => {
  try {
    const rows = await fetchSheetRows();
    return rows.map(normalizeSheetPost).filter((post): post is BlogPost => post !== null);
  } catch {
    return [];
  }
});

export async function getBlogPosts(): Promise<BlogPost[]> {
  return getBlogPostsCached();
}

const getBlogPostBySlugCached = cache(async (slug: string): Promise<BlogPost | null> => {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return getBlogPostBySlugCached(slug);
}

export function buildBlogFaqJsonLd(post: BlogPost) {
  if (post.faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  } as const;
}

export function buildBlogPostingJsonLd(post: BlogPost): BlogPostingJsonLd {
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: canonical,
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage ? { image: post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}` } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt, dateModified: post.publishedAt } : {}),
    author: {
      "@type": "Organization",
      name: "madmonos",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "madmonos",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: SITE_LOGO_URL },
    },
    ...(post.entities.length > 0 ? { keywords: post.entities.join(", ") } : {}),
  };
}
