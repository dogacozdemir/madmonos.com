import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navClearancePaddingClass } from "@/lib/nav-clearance";
import { getBlogPosts } from "@/lib/blog-posts";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const BLOG_DESCRIPTION = "Articles, notes, and updates from madmonos.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${SITE_URL}/blog`;
  return {
    title: "Blog",
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: `Blog | ${SITE_NAME}`,
      description: BLOG_DESCRIPTION,
      images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} blog` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog | ${SITE_NAME}`,
      description: BLOG_DESCRIPTION,
      images: [SITE_OG_IMAGE],
    },
  };
}

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main
      className={cn(
        "relative z-[2] min-h-[100svh] bg-mad-base",
        "px-[max(1rem,env(safe-area-inset-left))] pb-24",
        navClearancePaddingClass,
        "pr-[max(1rem,env(safe-area-inset-right))] md:px-12 lg:px-16"
      )}
    >
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-mad-aaa-gold sm:text-xs">
          Blog
        </p>
        <h1 className="mad-wordmark mt-4 text-[clamp(2rem,6vw,3.5rem)] font-light !leading-[1.12] tracking-tight text-mad-aaa-primary">
          Writing
        </h1>
        <p className="mt-6 text-lg font-medium leading-relaxed text-mad-aaa-body">
          Fresh notes from the Madmonos team. Built from Sheets at build-time for fast delivery.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-2xl border border-[color:var(--mad-border-highlight-mid)] bg-[rgba(54,23,56,0.45)] backdrop-blur-sm"
            >
              {post.coverImage ? (
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    width={1200}
                    height={675}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mad-gold">
                  {post.category}
                </p>
                <h2 className="text-xl font-semibold text-mad-aaa-primary">{post.title}</h2>
                <p className="text-sm leading-relaxed text-mad-aaa-body">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-mad-aaa-gold transition-colors hover:text-mad-gold"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
          <Link
            href="/#insights"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-mad-aaa-gold transition-colors hover:text-mad-gold"
          >
            View insights
          </Link>
          <Link
            href="/#hero"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-mad-aaa-body transition-colors hover:text-mad-aaa-primary"
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
