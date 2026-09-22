import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

/* Social share card, generated at build time by Next's OG renderer — no manual
   1200×630 PNG to keep in sync. Latin text only, so the renderer's default
   font is enough; no font files to fetch. Brand tokens are inlined because the
   OG renderer sees none of the site's CSS. */
export const runtime = "nodejs";
export const alt = "Funavry Technologies — Build. Automate. Operate.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#21262A";
const PAPER = "#F5F6F4";
const AZURE = "#449ED8";
const AMBER = "#F59F13";
const STEEL = "#8FA9B8";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `radial-gradient(1200px 600px at 15% 0%, #2b3a45 0%, ${INK} 55%)`,
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "rgba(245,246,244,0.66)",
            fontSize: "22px",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: AZURE,
            }}
          />
          AI-First Engineering &amp; Global Business Services
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: PAPER,
              fontSize: "96px",
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.05,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              gap: "28px",
              marginTop: "28px",
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            <span style={{ color: AZURE }}>Build.</span>
            <span style={{ color: AMBER }}>Automate.</span>
            <span style={{ color: STEEL }}>Operate.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "rgba(245,246,244,0.55)",
            fontSize: "26px",
          }}
        >
          funavry.com
        </div>
      </div>
    ),
    { ...size },
  );
}
