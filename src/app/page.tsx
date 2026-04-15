import { HeroMaskedDigitalPresent } from "@/components/hero-masked-digital-present";
import { HorizontalServiceScroll } from "@/components/horizontal-service-scroll";
import { LatestNews } from "@/components/latest-news";
import { SolutionsSemantic } from "@/components/solutions-semantic";
import { SpotlightTeamStage } from "@/components/team/spotlight-team-stage";
import { StructuredData } from "@/components/structured-data";
import { StickySolutions } from "@/components/sticky-solutions";
import { TypographyImpactSection } from "@/components/typography-impact-section";
import { getBlogPosts } from "@/lib/blog-posts";
import { MarTechMarquee } from "@/components/martech-marquee";

/**
 * Server-first route with ISR. Interactive GSAP sections remain isolated client components.
 */
export const revalidate = 3600;

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <>
      <StructuredData />
      <main className="relative z-[2]">
        <HeroMaskedDigitalPresent />
        <StickySolutions />
        <SpotlightTeamStage />
        <TypographyImpactSection />
        <HorizontalServiceScroll />
        <LatestNews posts={posts} />
        <SolutionsSemantic />
        <MarTechMarquee />
      </main>
    </>
  );
}
