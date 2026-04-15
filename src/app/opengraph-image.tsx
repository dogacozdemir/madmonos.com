import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "madmonos — AI Marketing · MarTech · GTM Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image for all routes without a route-specific override.
 * Uses ImageResponse (edge runtime) — no Node.js dependencies.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060308",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial glow — brand plum */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 72% 55% at 50% 52%, rgba(86,44,82,0.82) 0%, rgba(38,14,40,0.6) 45%, rgba(6,3,8,0) 72%)",
          }}
        />

        {/* Corner vignettes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 60% at 0% 0%, rgba(0,0,0,0.55) 0%, transparent 60%), radial-gradient(ellipse 55% 60% at 100% 100%, rgba(0,0,0,0.55) 0%, transparent 60%)",
          }}
        />

        {/* Top rule */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 72,
            right: 72,
            height: 1,
            background: "rgba(201,174,85,0.22)",
          }}
        />

        {/* Content stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            position: "relative",
          }}
        >
          {/* Kicker */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#c9ae55",
              marginBottom: 22,
            }}
          >
            Digital Agency
          </div>

          {/* Wordmark */}
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
              color: "#e3d0ea",
              lineHeight: 1,
              textShadow: "0 0 80px rgba(92,47,88,0.9)",
            }}
          >
            madmonos
          </div>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 2,
              background: "rgba(201,174,85,0.55)",
              borderRadius: 2,
              marginTop: 28,
              marginBottom: 28,
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(227,208,234,0.75)",
            }}
          >
            AI Marketing · MarTech · GTM Engineering
          </div>

          {/* Four pillars */}
          <div
            style={{
              display: "flex",
              gap: 48,
              marginTop: 36,
            }}
          >
            {["Creative", "Performance", "Operations", "Technical"].map((p) => (
              <div
                key={p}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(201,174,85,0.52)",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom rule + URL */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 72,
            right: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(201,174,85,0.16)",
              marginRight: 24,
            }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "rgba(201,174,85,0.45)",
            }}
          >
            madmonos.com
          </div>
          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(201,174,85,0.16)",
              marginLeft: 24,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
