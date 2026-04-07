"use client";

import Link from "next/link";
import { DiscoveryTrigger } from "@/components/discovery/discovery-trigger";
import { FooterInfiniteCta } from "@/components/footer-infinite-cta";

export function SiteFooter() {
  return (
    <footer className="relative text-mad-highlight">
      <FooterInfiniteCta />

      <div className="px-6 pb-6 pt-5 md:pb-8 md:pt-6 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mad-gold">Madmonos</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-mad-highlight">
              Speed to market. Technical authority. AI-native delivery — Istanbul &amp; worldwide.
            </p>
            <div className="mt-4">
              <DiscoveryTrigger className="!inline-flex !min-h-12 !min-w-12 !items-center !justify-center !text-[10px] !tracking-[0.12em] md:!text-xs">
                Discovery brief
              </DiscoveryTrigger>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm font-semibold">
            <Link
              href="#projects"
              className="inline-flex min-h-12 items-center text-mad-highlight transition-colors hover:text-mad-gold"
            >
              Projects
            </Link>
            <Link
              href="#impact"
              className="inline-flex min-h-12 items-center text-mad-highlight transition-colors hover:text-mad-gold"
            >
              Impact
            </Link>
            <Link
              href="#services"
              className="inline-flex min-h-12 items-center text-mad-highlight transition-colors hover:text-mad-gold"
            >
              Services
            </Link>
            <Link
              href="#insights"
              className="inline-flex min-h-12 items-center text-mad-highlight transition-colors hover:text-mad-gold"
            >
              Insights
            </Link>
            <Link
              href="#marquee"
              className="inline-flex min-h-12 min-w-8 items-center justify-center text-mad-highlight transition-colors hover:text-mad-gold"
            />
            <a
              href="mailto:hello@madmonos.com"
              className="inline-flex min-h-12 items-center text-mad-highlight transition-colors hover:text-mad-gold"
            >
              Contact
            </a>
          </nav>
        </div>
        <p className="mx-auto mt-5 max-w-6xl text-xs font-medium text-mad-highlight md:mt-6">
          © {new Date().getFullYear()} Madmonos. AI marketing, MarTech, and GTM engineering.
        </p>
      </div>
    </footer>
  );
}
