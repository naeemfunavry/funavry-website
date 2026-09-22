import type { Config } from "tailwindcss";

/**
 * The admin panel's tokens are the website's tokens.
 *
 * Copied deliberately rather than imported from apps/web: the two apps build
 * independently and a cross-package Tailwind config would couple their build
 * graphs for the sake of one object. The values are the brand's, and the
 * comments explaining why each exists live in the web config.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Engineering paper. */
        paper: {
          DEFAULT: "#F5F6F4",
          deep: "#EDEFEB",
          white: "#FFFFFF",
        },
        /* Charcoal from the logo wordmark. */
        ink: {
          DEFAULT: "#2E3436",
          900: "#21262A",
          700: "#2E3436",
          500: "#63696B",
          /* Meets WCAG AA on the paper backgrounds. */
          400: "#656B6D",
        },
        /* Logo azure — structure, the BUILD phase. */
        azure: {
          DEFAULT: "#449ED8",
          ink: "#1F5F87",
          600: "#2F82B8",
          300: "#8FCAEB",
          100: "#DDEEF9",
          50: "#EFF7FC",
        },
        /* Logo amber — energy, the AUTOMATE phase. */
        amber: {
          DEFAULT: "#F59F13",
          ink: "#8A5606",
          600: "#D8890D",
          300: "#F9C777",
          100: "#FDEBCF",
          50: "#FEF6E8",
        },
        /* Logo gradient midpoint — the OPERATE phase. */
        steel: {
          DEFAULT: "#376079",
          ink: "#25404E",
          600: "#2E5062",
          300: "#8FA9B8",
          100: "#DBE3E8",
          50: "#EFF3F5",
        },
        line: {
          DEFAULT: "#E1E4DF",
          soft: "#EAEDE8",
          strong: "#CDD2C9",
        },
        /* Status colours, which the marketing site has no need for. */
        danger: {
          DEFAULT: "#C2410C",
          ink: "#7C2D12",
          100: "#FFEDD5",
          50: "#FFF7ED",
        },
        success: {
          DEFAULT: "#15803D",
          ink: "#14532D",
          100: "#DCFCE7",
          50: "#F0FDF4",
        },
      },
      fontFamily: {
        sans: ["var(--font-urbanist)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        /* A tighter ramp than the site's display scale — this is an interface
           for reading dense tables, not a page designed to be scrolled. */
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        label: ["0.75rem", { lineHeight: "1.1rem", letterSpacing: "0.04em" }],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(33, 38, 42, 0.04), 0 8px 24px rgba(33, 38, 42, 0.06)",
        pop: "0 8px 32px rgba(33, 38, 42, 0.12)",
      },
      backgroundImage: {
        /* The site's grid-paper texture, at the same scale. */
        "grid-paper":
          "linear-gradient(to right, rgba(205,210,201,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(205,210,201,0.35) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-paper": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
