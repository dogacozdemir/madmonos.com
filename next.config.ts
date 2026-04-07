import type { NextConfig } from "next";

/**
 * Static export (`output: "export"`): `next.config` içindeki `headers()` üretim çıktısına
 * uygulanmaz (Next uyarısı). Görseller için `Cache-Control`: `public/_headers` (Netlify /
 * Cloudflare Pages), `serve` önizlemesi için kökte `serve.json` (`postbuild` → `out/serve.json`)
 * veya barındırıcı panelinde tanımlayın — `public/` → `out/` ile kopyalanır.
 *
 * Güvenlik başlıklarını production’da CDN veya barındırıcı panelinde verin, örneğin:
 * - X-DNS-Prefetch-Control: on
 * - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
 * - X-Frame-Options: SAMEORIGIN
 * - X-Content-Type-Options: nosniff
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
 */

const nextConfig: NextConfig = {
  output: "export",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    /** Static export: `/_next/image` yok; görseller `public` üzerinden. */
    unoptimized: true,
    /** next/image `quality` prop izin listesi (ör. 72 kinetic rail). */
    qualities: [70, 72, 75],
  },
};

export default nextConfig;
