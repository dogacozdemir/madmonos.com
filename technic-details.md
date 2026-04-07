Aşağıda, repodaki gerçek dosyalara dayanan uçtan uca teknik ve tasarımsal döküm yer alıyor.

1. Teknoloji yığını ve mimari
Framework ve çalışma biçimi: Next.js 16.2.1 App Router, React 19, TypeScript. Üretim çıktısı statik export (output: "export" in next.config.ts); görseller next/image ile unoptimized: true (export’ta /_next/image yok, dosyalar public/ üzerinden servis edilir). Önizleme serve ile out klasöründen.

Dosya yapısı (özet):

src/app/ — layout.tsx, page.tsx, globals.css, robots.ts, sitemap.ts, loading.tsx, not-found.tsx
src/components/ — sayfa parçaları (hero, projects, team, impact, services, insights, marquee, nav, footer, providers, discovery modal vb.)
src/data/ — metin ve medya meta verisi (digital-present-projects, mad-genius-copy, team-spotlight, mad-insights)
src/lib/ — site URL, yardımcılar, kritik CSS, ScrollTrigger yenileme planlaması
Bileşen mimarisi: Ana sayfa (page.tsx) ince bir kompozisyon katmanı; ağır bölümler next/dynamic ile yükleniyor, çoğunda ssr: true ve skeleton benzeri loading fallback’leri var. Yerleşim: Providers → AppShell (sabit footer + üstte kaydırmalı sütun + grain overlay).

Global state / veri akışı: Redux veya benzeri global store yok. Veri akışı:

Sunucu/derleme: layout metadata, StructuredData (JSON-LD), statik veri modülleri
İstemci: React.createContext — DiscoveryProvider (brief modal açık/kapalı), TeamSpotlightNavProvider (takım bölümündeyken nav görünümü), SmoothScrollProvider (Lenis + GSAP eşlemesi). Yerel useState bileşen içinde (ör. projelerde aktif slide, menü açık/kapalı).
2. Tasarım sistemi
UI kütüphanesi: Tailwind CSS v4 (@import "tailwindcss", @theme inline ile globals.css içinde tema token’ları). Styled Components yok. Yardımcılar: clsx, tailwind-merge (cn).

Renk paleti (ana hex’ler — globals.css :root):

Token / kullanım	Hex / not
--mad-base
#3a1d36
--mad-deep
#562c52
--mad-accent
#9c70b2
--mad-highlight
#e3d0ea
--mad-gold / --mad-gold-dark
#c9ae55 / #b08f38
--mad-void
#060308
--mad-mist / --mad-plane-light
#efe8f4 / #f2ebf6
Metin (koyu zemin AAA)
--mad-text-aaa-primary #f8fafc, --mad-text-aaa-body #cbd5e1
Açık zemin gövde
--mad-text-on-light-body #2a1828 vb.
Ayrıca sınır, gölge, mesh ve bileşen özel efektleri için çok sayıda rgba(...) ve gradient token’ı tanımlı (ör. --mad-border-gold-*, --mad-spot-beam-gold).

Tipografi:

Geist Sans — gövde (--font-geist-sans, font-sans), preload açık
Geist Mono — etiketler, terminal, chip’ler (--font-geist-mono)
Montserrat 300 — wordmark / hero h1 “madmonos” (.mad-wordmark, font-synthesis: none)
Oswald 600/700 — display (--font-display): servis başlıkları, impact başlıkları, insights başlıkları vb.
Boyutlar çoğunlukla Tailwind + clamp() ile responsive (ör. hero h1, servis h2, impact köşe başlıkları).

Spacing: Standart Tailwind spacing ölçeği; max-w-*, gap-*, px/py ile grid; safe-area (env(safe-area-inset-*)) başlıca nav ve hero shell’de. Bölüm yükseklikleri sıkça min-h-[100svh], dvh, veya çok uzun scroll sahnesi için sabit çarpanlı h-[450vh] / h-[500vh] (team / services pin).

3. Scroll tabanlı animasyon mekaniği
Kütüphaneler: GSAP 3 + ScrollTrigger; yumuşak kaydırma için Lenis (sadece belirli koşullarda). Framer Motion projede yok.

Lenis: SmoothScrollProvider içinde, yalnızca prefers-reduced-motion kapalı, (pointer: fine) ve min-width: 768px iken devreye giriyor; mobil/dokunmatikte native scroll. ScrollTrigger.scrollerProxy(document.documentElement, …) ile sanal scroll konumu GSAP ile senkron; lenis.on("scroll", ScrollTrigger.update) ve gsap.ticker ile RAF.

ScrollTrigger kullanım örnekleri:

Horizontal servisler (horizontal-service-scroll.tsx): Bölüm yüksekliği 500vh, içteki sütun pin; scrub: 1.2 ile ilerleme → başlıkların yatay x konumu, odak ağırlığına göre opacity/scale, açıklama ve karakter görsellerinin çapraz fade’i, maskeleme, “debris” SVG’lerinin hareketi.
Impact (typography-impact-section.tsx): Uzun bölüm + sticky viewport; scroll progress ile tarama çizgisi (top), clipPath ile katmanlı gorilla görseli, köşe başlıklarının translateX, sayaç metinleri, terminal “yazım” efekti; isteğe bağlı pointer bias. scrub: true (Lenis ile çift yumuşatmayı azaltmak için).
Takım (spotlight-team-stage.tsx): Yüksek bölüm + pin; ilerlemeye göre spotlight ışınının x kayması, üyelerde grayscale/scale, metin bloklarının yatay kayması; mobilde yatay track xPercent.
Projects (sticky-solutions.tsx): clipPath açılışı, rail fade-in, dikey progress çubuğu scaleY, segment bazlı görsel y “lift” scrub; aktif proje viewport merkezine göre JS ile hesaplanıyor (histerezis ile).
Insights (latest-news.tsx): Tetikleyici #services bitişi; bölüm ve kartlara fromTo + scrub ile clip/y/rotate stagger.
SitePlaneController: Sadece #insights için ScrollTrigger ile body.site-plane-light sınıfı (açık zemin); yorumda Impact de geçse kod yalnızca insights seçiyor.
Parallax / benzeri: Klasik “katmanlı parallax kütüphanesi” yok; scrub ile bağlı transform/clipPath/mask ve sticky + pin kombinasyonları var. CSS tarafında mesh Ken Burns, marquee, footer dalgası gibi sürekli animasyonlar globals.css içinde (@keyframes).

Erişilebilirlik: prefers-reduced-motion: reduce birçok yerde animasyonları devre dışı bırakıyor veya sabit kareye indiriyor.

4. Section bazlı içerik haritası (ana sayfa sırası)
Sıra page.tsx ile aynı.

1) Nav (Nav) — header, sabit pill
Metin: anchor etiketleri (Hero, Projects, Impact, Services, Insights, Runtime), wordmark link.
Görsel: logo-nav.webp (dosyada kullanım), tam ekran menü animasyonları CSS sınıflarıyla.
Etkileşim: Discovery tetikleyici, manyetik yakınlık (MagneticProximity), takım aktifken nav border/glow; mobilde overflow hidden.
2) Hero — HeroMaskedDigitalPresent, #hero
H1: “madmonos”
Üst mono: “Adapting brands to the AI era. Period.”
Sol alt (md iki sütun): “End-to-end operational solution that respects your time and money.”
Sağ alt: Madmonos tanıtım paragrafı (AI-first agency, SEO-GEO, dashboard, otomasyon vb.)
Görsel: masaüstünde HeroGradientCanvas, mobilde .mad-hero-css-mesh + scrim.
Animasyon: .anim-fade-in öğelerinde dinamik import ile GSAP stagger reveal; reduced motion’da yok.
3) Projects — StickySolutions, #projects
Masaüstü: sol sütun uzun scroll + sticky kartlar; sağ Project index rail (aktif slide metni).
Her slide: clientCode, h2 title, body description; görsel next/image (/assets/*.webp), technicalBadge chip.
Mobil: KineticProjectRailMobile (ayrı bileşen).
Scroll: GSAP ScrollTrigger (mask, progress, görsel lift, aktif indeks).
4) Team — SpotlightTeamStage, #team-spotlight (nav’da doğrudan link yok; bölüm var)
Üst kicker: “Our team”
Her üye: h3 isim (iki satıra bölünebilir), mono title, bio (çoğu boş veri)
Görseller: /assets/team/*.webp
Sahne: void orb, stage plane, altın beam, grain, SVG displacement; scroll ile spotlight ve metin kayması.
5) Impact — TypographyImpactSection, #impact
H2: “Beautiful surfaces” (outline), “Brilliant systems” (altın)
Köşe kartları: SQL terminal örneği, “0+” / “0%” sayaçları (scroll ile artar)
Orta: /beautiful-surfaces.webp üç katman (soluk, x-ray band, parlak clip); altın tarama çizgisi
Teknik overlay: grid, snippet satırları
Scroll + pointer ile setFrame; gorilla scale pulse tween.
6) Boşluk — impact-services-buffer (ayırıcı, aria-hidden)
7) Services — HorizontalServiceScroll, #services
Üst: “Services”, “NO.01” … (scroll ile güncellenir)
Her slide h2: MORPHING_SERVICES başlıkları (5 adet: AI creative, Web dev, Automation, SEO / GEO, Strategy)
Alt: eşleşen açıklama paragrafları
Arka plan: HeroGradientCanvas + scrim + grain; ortada ServicesCharacterStack (/creative.webp, /developer.webp, /agent.webp, /performance.webp, /strategy.webp)
Scroll: pin + scrub, başlık yatay kaydırma, karakter cross-fade, radial mask nefesi.
8) Insights — LatestNews, #insights
Kicker “Insights”, h2: “Mad insights”
Kartlar: MAD_INSIGHTS — tarih, kategori, h3 başlık, görsel (/assets/insight-*.webp)
Scroll: services bitişine bağlı scrub reveal.
9) SolutionsSemantic — ekranda görünmez (sr-only)
h2: “Digital Solutions & GTM Systems”
DIGITAL_PRESENT_PROJECTS için semantik liste / microdata.
10) Runtime / Stack — MarTechMarquee, #marquee
Sonsuz yatay chip marquee (Next.js, Python, PyTorch, …)
Alt satır: “Trust & technical proof”
CSS mad-marquee-track animasyonu; reduced motion’da wrap düzeni.
Footer: SiteFooter — FooterInfiniteCta, kısa marka metni, Discovery, anchor linkler, telif. AppShell ile sabit altta, üst sütun margin-bottom ile açılıyor.

5. Hizmet sütunlarının işlenişi (dokümandaki 4 sütun vs sitedeki gösterim)
JSON-LD / FAQ (structured-data.tsx) içinde dört sütun açıkça tanımlı: Creative, Performance, Operations, Technical (GEO açıklaması ayrıca).

Ana sayfadaki yatay “morphing” servis şeridi ise MORPHING_SERVICES ile beş başlık: AI creative, Web dev, Automation, SEO / GEO, Strategy. Yani iş sözlüğü “4 pillar” ile UI’daki “5 rail slide” birebir aynı değil; Strategy/Web dev gibi kalemler dokümandaki dörtlüyü genişletiyor.

Görselleştirme ve interaktif öğeler:

Her servis için tam gövde “avatar” görseli (ServicesCharacterStack): scroll odak indeksine göre opacity geçişi, üstte scan-line “flicker” overlay, radial mask nefesi.
Projeler bölümü dört ana yönü örnek vaka görselleriyle destekliyor: Creative (gen-AI), GEO, Performance ads, Automation stack, Ops dashboard — yani Operasyon/Teknik/Kreatif/Performans izleri burada yoğun.
AI / dashboard teması: Metinde ve görsellerde (özellikle ops-dashboard.webp, performans ve otomasyon illüstrasyonları) kontrol paneli ve veri akışı vurgusu var; ayrıca Impact sahnesinde “terminal/SQL” ve topology metni teknik otoriteyi pekiştiriyor.

6. Navigasyon ve responsive yapı
Menü: Sabit üst “pill” — iç linkler #hero, #projects, #impact, #services, #insights, #marquee (Runtime). Tam ekran overlay menü (iki satırlı etiket animasyonları, globals.css).

Footer nav: Projects, Impact, Services, Insights, boş görünen bir #marquee linki (kodda href var, içerik yok — muhtemel eksik), Contact mail.

Responsive strateji:

Breakpoint’ler: sm / md / lg / xl Tailwind ile; takım için lg grid vs mobil yatay şerit.
Projects: md altı mobil rail, üstü grid lg:grid-cols-10 (6+4).
Hero: mobilde daha küçük clamp tipografi, mesh alternatifi.
Lenis: tablet/desktop fine pointer; mobil native scroll.
Touch: min-h/svh/dvh ile viewport uyumu; safe-area padding.
7. Performans ve SEO / GEO
Meta ve paylaşım: layout.tsx metadata — title şablonu, description, keywords, Open Graph, Twitter card, canonical, robots: { index, follow }. metadataBase = SITE_URL (lib/site.ts, NEXT_PUBLIC_SITE_URL ile override).

GEO / yapılandırılmış veri: StructuredData — Organization, Service, ItemList, Project/CreativeWork ilişkileri, FAQPage girişleri (GEO tanımı, dört sütun, iletişim, kanıt). Bu, klasik SEO’nun ötesinde LLM / AI arama için içerik ve şema zenginliği sağlıyor.

Semantik HTML: Bölümlerde aria-label, main, section, article, h1–h3 hiyerarşisi; projelerde itemScope / CreativeWork; gizli SolutionsSemantic ile makine okuması.

Performans uygulamaları:

Statik export, üretimde removeConsole
Dynamic import: GSAP/Lenis ağır chunk’lar ilk boyamadan sonra
LCP: Hero wordmark font preload (Montserrat), ilk proje görseli priority / fetchPriority, servis karakterinde ilk slide priority
Görseller: sizes ile responsive hints, çoğu kartta quality={70}, lazy loading ilk panel dışı
next/image unoptimized (export kısıtı) — yine de width/height ve sizes ile düzen
Kritik CSS: CRITICAL_INLINE_CSS inline <style>
public/_headers ve serve.json yorumlarında cache / güvenlik başlıkları notu
browserslist modern tarayıcılar
Not: MarTechMarquee aria-labelledby="marquee-stack-title" kullanıyor fakat aynı id’ye sahip bir başlık yok; erişilebilirlik etiketlemesi için küçük bir uyumsuzluk.

Özetle site, Next statik export + Tailwind tasarım token’ları + GSAP ScrollTrigger omurgası üzerinde; Lenis yalnızca masaüstü ince işaretçide devreye giriyor. İçerik ve şema tarafında GEO / AI arama düşüncesi bilinçli şekilde işlenmiş; görsel anlatım ise özellikle projeler rail’i, servis-karakter yığını ve Impact X-ray sahnesinde yoğunlaşıyor.