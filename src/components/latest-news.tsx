"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-posts";
import { cn } from "@/lib/utils";

/** Mad Insights — `#services` bitişiyle scrub’da el ele (peek + reveal). */
export function LatestNews({ posts }: { posts: BlogPost[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const visiblePosts = posts.slice(0, 3);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const raf = requestAnimationFrame(() => {
      void (async () => {
        const section = sectionRef.current;
        const cards = cardsRef.current;
        const services = document.getElementById("services");
        if (!section || !cards || !services || cancelled || visiblePosts.length === 0) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const items = cards.querySelectorAll(".insight-card");

        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          if (reduced) return;

          gsap.fromTo(
            section,
            { clipPath: "inset(0% 0% 6% 0%)", y: 20, opacity: 0.92 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0,
              opacity: 1,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: services,
                start: "bottom bottom",
                end: "bottom 55%",
                scrub: 1.2,
                invalidateOnRefresh: true,
                refreshPriority: -2,
              },
            }
          );

          gsap.fromTo(
            items,
            { y: 72, opacity: 0, rotate: 2.2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              force3D: true,
              stagger: { each: 0.06 },
              ease: "none",
              scrollTrigger: {
                trigger: services,
                start: "bottom 92%",
                end: "bottom 38%",
                scrub: 1.2,
                invalidateOnRefresh: true,
                refreshPriority: -2,
              },
            }
          );
        }, section);
      })();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [visiblePosts.length]);

  if (visiblePosts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="relative z-[10] scroll-mt-[4.5rem] overflow-hidden bg-mad-mist pt-[clamp(3rem,8vh,5.5rem)] pb-12 [transform:translate3d(0,0,0)] md:pb-16"
      aria-label="Mad Insights"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <header className="relative z-[1]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--mad-text-insight-meta)]">
            Insights
          </p>
          <h2
            className={cn(
              "mt-3 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-mad-base md:text-[clamp(2.5rem,10vw,10rem)]"
            )}
          >
            Mad insights
          </h2>
        </header>

        <div
          ref={cardsRef}
          className="relative z-[1] mt-10 grid auto-rows-fr grid-cols-1 gap-8 md:mt-14 md:grid-cols-3 md:gap-x-6 md:gap-y-0 lg:gap-x-8"
        >
          {visiblePosts.map((post) => (
            <article
              key={post.slug}
              className={cn(
                "insight-card group relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--mad-border-accent-soft)] bg-[color:var(--mad-surface-mist-card)] shadow-[var(--mad-shadow-insight-card)] [transform:translate3d(0,0,0)]"
              )}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mad-border-gold-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mad-surface-mist-card)]"
                aria-label={`Read insight: ${post.title}`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-mad-deep">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    width={1200}
                    height={750}
                    quality={75}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 92vw, (max-width: 1280px) calc((100vw - 4rem) / 3), min(480px, 33vw)"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-mad-deep via-mad-base to-mad-accent"
                    aria-hidden
                  />
                )}
                </div>
                <div className="p-5 md:p-6">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--mad-text-insight-meta)] md:text-[11px]">
                    <span>{post.category}</span>
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold uppercase leading-[1.15] tracking-[-0.02em] text-mad-base md:text-2xl">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--mad-text-on-light-body)]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
