import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono, Montserrat, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { AppShell } from "@/components/layout/app-shell";
import { StructuredData } from "@/components/structured-data";
import { CRITICAL_INLINE_CSS } from "@/lib/critical-styles";
import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const SiteFooter = dynamic(() => import("@/components/site-footer").then((m) => m.SiteFooter), {
  ssr: true,
  loading: () => (
    <footer
      className="min-h-[20rem] bg-mad-deep"
      role="contentinfo"
      aria-label="Site footer"
    />
  ),
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
  preload: false,
});

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "optional",
  adjustFontFallback: true,
  /** Hero LCP `--font-montserrat`; Oswald gecikmeli yüklenebilir. */
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  /** Sadece hero “madmonos” başlığı (font-light). */
  weight: ["300"],
  display: "optional",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Marketing, MarTech & GTM Engineering | GEO-ready`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "madmonos",
    "AI marketing agency",
    "Generative Engine Optimization",
    "GEO SEO",
    "MarTech integration",
    "Go-to-market acceleration",
    "AI video production",
    "marketing automation",
    "Perplexity SEO",
    "AI search visibility",
    "full-stack marketing engineering",
  ],
  authors: [{ name: "madmonos", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI-native agency for GTM speed`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Madmonos brand mark — AI marketing and MarTech agency focused on go-to-market velocity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI marketing & MarTech`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      "en-US": SITE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <style
          id="mad-critical-inline-css"
          dangerouslySetInnerHTML={{ __html: CRITICAL_INLINE_CSS }}
        />
      </head>
      <body className="min-h-full bg-mad-base font-sans text-mad-aaa-body">
        <StructuredData />
        <Providers>
          <AppShell footer={<SiteFooter />}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
