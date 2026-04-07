import dynamic from "next/dynamic";
import { Nav } from "@/components/nav";
import { HeroMaskedDigitalPresent } from "@/components/hero-masked-digital-present";
import { SolutionsSemantic } from "@/components/solutions-semantic";

const StickySolutions = dynamic(
  () => import("@/components/sticky-solutions").then((m) => m.StickySolutions),
  {
    ssr: true,
    loading: () => (
      <section
        id="projects"
        className="relative z-[30] min-h-[min(58dvh,30rem)] w-full border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base"
        aria-label="Selected client work and project lines"
      />
    ),
  }
);

const SpotlightTeamStage = dynamic(
  () => import("@/components/team/spotlight-team-stage").then((m) => m.SpotlightTeamStage),
  {
    ssr: true,
    loading: () => (
      <section
        className="min-h-[85vh] w-full bg-mad-void"
        aria-hidden
      />
    ),
  }
);

const LatestNews = dynamic(
  () => import("@/components/latest-news").then((m) => m.LatestNews),
  {
    ssr: true,
    loading: () => (
      <section className="min-h-[40vh] w-full bg-mad-mist" aria-hidden />
    ),
  }
);

const TypographyImpactSection = dynamic(
  () => import("@/components/typography-impact-section").then((m) => m.TypographyImpactSection),
  {
    ssr: true,
    loading: () => (
      <section className="min-h-[70vh] w-full bg-mad-void" aria-hidden />
    ),
  }
);

const HorizontalServiceScroll = dynamic(
  () => import("@/components/horizontal-service-scroll").then((m) => m.HorizontalServiceScroll),
  {
    ssr: true,
    loading: () => (
      <section
        id="services"
        className="min-h-[100vh] w-full bg-mad-base"
        aria-hidden
      />
    ),
  }
);

const MarTechMarquee = dynamic(
  () => import("@/components/martech-marquee").then((m) => m.MarTechMarquee),
  {
    ssr: true,
    loading: () => (
      <section className="min-h-[8rem] w-full bg-mad-void" aria-hidden />
    ),
  }
);

/**
 * Hero + sticky projects stay eager (LCP). Team, impact, services rail, insights, marquee lazy-hydrate with ssr.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[2]">
        <HeroMaskedDigitalPresent />
        <StickySolutions />
        <SpotlightTeamStage />
        <TypographyImpactSection />
        <div
          className="impact-services-buffer relative z-[12] min-h-[min(14svh,120px)] w-full bg-mad-deep [transform:translate3d(0,0,0)]"
          aria-hidden
        />
        <HorizontalServiceScroll />
        <LatestNews />
        <SolutionsSemantic />
        <MarTechMarquee />
      </main>
    </>
  );
}
