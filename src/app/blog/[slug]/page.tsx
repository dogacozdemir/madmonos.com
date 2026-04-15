import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { navClearancePaddingClass } from "@/lib/nav-clearance";
import {
  buildBlogFaqJsonLd,
  buildBlogPostingJsonLd,
  getBlogPostBySlug,
  getBlogPosts,
} from "@/lib/blog-posts";
import styles from "@/app/blog/blog-markdown.module.css";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

type PageProps = {
  params: { slug: string };
};

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const token = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = token.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("**") && raw.endsWith("**")) {
      nodes.push(<strong key={`i-${key++}`}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      nodes.push(<em key={`i-${key++}`}>{raw.slice(1, -1)}</em>);
    } else if (raw.startsWith("`") && raw.endsWith("`")) {
      nodes.push(<code key={`i-${key++}`}>{raw.slice(1, -1)}</code>);
    } else if (raw.startsWith("[")) {
      const parts = raw.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (parts) {
        nodes.push(
          <a key={`i-${key++}`} href={parts[2]} target="_blank" rel="noopener noreferrer">
            {parts[1]}
          </a>
        );
      } else {
        nodes.push(raw);
      }
    } else {
      nodes.push(raw);
    }
    last = token.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdownContent(markdown: string): ReactNode {
  const lines = (typeof markdown === "string" ? markdown : "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`b-${key++}`}>
        {listItems.map((item, idx) => (
          <li key={`li-${idx}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    if (trimmed.startsWith("### ")) {
      blocks.push(<h4 key={`b-${key++}`}>{renderInlineMarkdown(trimmed.slice(4).trim())}</h4>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<h3 key={`b-${key++}`}>{renderInlineMarkdown(trimmed.slice(3).trim())}</h3>);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(<h2 key={`b-${key++}`}>{renderInlineMarkdown(trimmed.slice(2).trim())}</h2>);
      continue;
    }
    blocks.push(<p key={`b-${key++}`}>{renderInlineMarkdown(trimmed)}</p>);
  }

  flushList();
  return <Fragment>{blocks}</Fragment>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  if (posts.length === 0) return [{ slug: "__seed" }];
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const canonical = slug === "__seed" ? `${SITE_URL}/blog` : `${SITE_URL}/blog/${slug}`;
  if (slug === "__seed") {
    return {
      title: "Blog",
      description: "Articles and updates from Madmonos.",
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        siteName: SITE_NAME,
        title: `Blog | ${SITE_NAME}`,
        description: "Articles and updates from Madmonos.",
        images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} blog` }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Blog | ${SITE_NAME}`,
        description: "Articles and updates from Madmonos.",
        images: [SITE_OG_IMAGE],
      },
    };
  }
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Blog",
      alternates: { canonical: `${SITE_URL}/blog` },
    };
  }

  const ogImage = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${SITE_URL}${post.coverImage}`
    : SITE_OG_IMAGE;
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.entities,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params;
  if (slug === "__seed") {
    return (
      <main
        className={cn(
          "relative z-[2] min-h-[100svh] bg-mad-base",
          "px-[max(1rem,env(safe-area-inset-left))] pb-24",
          navClearancePaddingClass,
          "pr-[max(1rem,env(safe-area-inset-right))] md:px-12 lg:px-16"
        )}
      >
        <article className="mx-auto max-w-3xl">
          <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-light leading-tight text-mad-aaa-primary">
            Blog is updating
          </h1>
          <p className="mt-4 text-lg text-mad-aaa-body">
            Content will appear here after the next successful data sync.
          </p>
        </article>
      </main>
    );
  }
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const faqJsonLd = buildBlogFaqJsonLd(post);
  const blogPostingJsonLd = buildBlogPostingJsonLd(post);

  return (
    <main
      className={cn(
        "relative z-[2] min-h-[100svh] bg-mad-base",
        "px-[max(1rem,env(safe-area-inset-left))] pb-24",
        navClearancePaddingClass,
        "pr-[max(1rem,env(safe-area-inset-right))] md:px-12 lg:px-16"
      )}
    >
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mad-gold">
          {post.category}
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-light leading-tight text-mad-aaa-primary">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-mad-aaa-body">{post.excerpt}</p>
        {post.coverImage ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[color:var(--mad-border-highlight-mid)]">
            <Image
              src={post.coverImage}
              alt={post.coverAlt}
              width={1200}
              height={675}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <section className={cn(styles.blogMarkdown, "mt-10 space-y-5 text-[1.02rem] leading-8 text-mad-aaa-body")}>
          {renderMarkdownContent(post.content)}
        </section>
        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
        />

        <Link
          href="/blog"
          className="mt-12 inline-flex items-center text-sm font-semibold uppercase tracking-wider text-mad-aaa-gold transition-colors hover:text-mad-gold"
        >
          ← Back to blog
        </Link>
      </article>
    </main>
  );
}
