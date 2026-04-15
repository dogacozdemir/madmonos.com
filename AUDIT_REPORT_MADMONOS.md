# Madmonos Codebase Audit Report

Codebase-wide audit completed against the Madmonos playbook focus ("end-to-end marketing, accelerated by AI").  
Scope included app/router pages, core components, data libs, Next config, structured data, discovery flow, and existing Lighthouse artifacts.

| Category | Observation | Recommendation | RATIONALE | Priority |
|---|---|---|---|---|
| Performance | Mobile Lighthouse is weak: performance `0.38`, LCP ~`6.0s`; desktop is better (`0.6`, LCP ~`1.8s`). CLS is good on both (~`0.000088` mobile / `0.000048` desktop). | Treat mobile LCP as P0: move hero to poster-first render, lazy-upgrade to video after initial paint/interaction; reduce initial JS/animation work. | Your brand promise is "accelerated"; mobile-first LCP is the first proof point for that promise. | Critical |
| Performance | `next.config.ts` uses static export + `images.unoptimized: true`, so you lose runtime image optimization. | Add build-time responsive image pipeline (multiple widths + AVIF/WebP + `srcset`) and map usage to breakpoint-specific assets. | AI agency visuals are heavy by default; without responsive derivatives, bandwidth and LCP regress quickly. | High |
| Performance | Video-heavy sections likely decode/render multiple large loops concurrently (hero + cinematic sections). | Ensure only active video plays; pause/unmount non-visible streams; add WebM/AV1 sources and tighter mobile variants. | Concurrent decorative video playback causes CPU/battery cost and degrades interactivity on mid-tier devices. | High |
| Performance | Many animation-heavy components (GSAP/ScrollTrigger-heavy sections) are pinned and long-lived. | Gate animations by viewport and reduced-motion, reduce simultaneous triggers, and move expensive effects (blur/filter) to pre-rendered assets where possible. | High animation debt translates into INP/TBT regressions and "laggy premium" feel. | High |
| SEO / GEO | Homepage insights cards are not linked to blog detail pages (discoverability/internal linking loss). | Make cards/titles actual links to `/blog/[slug]`; preserve semantic anchors. | Internal links are core for classic SEO and for AI retrieval/citation graph traversal. | High |
| SEO / GEO | FAQ JSON-LD is paired with `sr-only` hidden FAQ content. | Add a visible FAQ module (can be compact accordion) aligned with JSON-LD content. | Stronger trust/eligibility signals for search systems and better human transparency. | High |
| SEO / GEO | No explicit AI crawler guidance file (no `llms.txt` / equivalent policy doc found). | Add `public/llms.txt` with site purpose, canonical sections, preferred citation URLs, and contact policy. | GEO readiness is partly machine-guidance; this helps generative engines summarize brand intent accurately. | Medium |
| SEO / GEO | Structured data uses fragment-only entity IDs for projects/services (`/#project-*`, `/#service-*`). | Prefer resolvable canonical entity URLs (`/portfolio/...`, `/services/...`) where feasible. | Canonical entity URLs improve AI knowledge graph alignment and shareability. | Medium |
| SEO / GEO | Portfolio metadata has Open Graph basics but lacks richer Twitter/OG image details. | Add explicit OG image metadata + Twitter card payload for portfolio page. | Better social previews improve CTR and influence secondary AI/search ranking signals. | Medium |
| Accessibility | Core interactive storytelling sections are largely pointer/scroll-driven (limited keyboard parity). | Add keyboard model: Next/Prev controls, roving tabindex, focusable project/service controls, and clear focus-visible states. | "Frictionless" includes keyboard and assistive-tech users; otherwise premium UX becomes exclusionary. | High |
| Accessibility | Discovery success state auto-fades/closes quickly. | Keep success persistent until user dismisses or provide clear optional timeout controls. | Time-limited messaging can fail WCAG timing/readability expectations and reduce trust in lead flow. | High |
| UX / Conversion | Lead submit uses `fetch(..., { mode: "no-cors" })`, so success cannot be reliably validated. | Move to verifiable endpoint (API route/server function) returning explicit success/error + retry semantics. | This is your revenue-critical flow; ambiguous submission state creates silent lead loss. | Critical |
| UX / Frictionless Ops | "Operations/dashboard" capability is heavily marketed in copy, but no concrete in-app operations module exists to validate flow quality. | Define or expose a real operations surface (even lightweight) and instrument it with UX telemetry/SLOs. | If operations excellence is a core promise, there should be at least one demonstrable productized flow. | Medium |
| Technical Architecture | No backend integration layer detected under `src/app` for CRM/ERP/webhook orchestration; current project is static-export-oriented. | Add integration boundary (API service/edge/backend) for CRM/ERP sync, webhook intake, queueing, and observability. | End-to-end AI growth operations require reliable system-to-system automation, not just marketing messaging. | High |
| Technical Architecture | Some large monolithic components reduce maintainability/reuse (e.g., long animation-heavy files). | Split into: presentational view + animation hook + config/data modules; standardize section contracts. | Improves scalability for team velocity, lowers regression risk, and enables incremental optimization. | Medium |
| Security / Content Integrity | Blog content parser builds HTML manually and renders via `dangerouslySetInnerHTML`. | Move to sanitized markdown pipeline (remark/rehype + allowlist sanitizer) with typed schema validation of external content. | AI/growth sites often ingest dynamic content; safe rendering is mandatory for trust and platform integrity. | High |

## Focused Answers to Requested Checks

- **Operations flow bottlenecks:** biggest functional bottleneck is the discovery/lead capture path (`no-cors` + timed auto-close). Also, no verifiable "dashboard/operations app flow" exists yet despite brand positioning.
- **AI-generated assets efficiency:** still images are mostly reasonable formats, but cinematic/video usage is the main cost driver and likely mobile perf killer.
- **CRM/ERP future automation readiness:** currently **architecturally underpowered** for real automation; no server integration boundary/webhook orchestration layer is present.

## Suggested Execution Order (Fastest Business Impact)

1. Fix lead submission reliability + success UX (Critical).
2. Reduce mobile LCP via hero/video strategy + build-time asset variants (Critical/High).
3. Add crawlable links + visible FAQ + `llms.txt` for GEO (High/Medium).
4. Introduce backend integration surface for CRM/ERP/webhooks (High).
5. Refactor biggest interactive components for maintainability/perf controls (Medium).
