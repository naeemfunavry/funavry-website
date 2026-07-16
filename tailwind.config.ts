import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
          400: "#868C8E",
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
      },
      fontFamily: {
        sans: ["var(--font-urbanist)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        /* One display ramp, used everywhere. Tight tracking, near-1 leading. */
        display: ["clamp(56px,9vw,132px)", { lineHeight: "0.9", letterSpacing: "-0.045em", fontWeight: "600" }],
        h1: ["clamp(40px,6.4vw,88px)", { lineHeight: "0.96", letterSpacing: "-0.04em", fontWeight: "600" }],
        h2: ["clamp(32px,4.6vw,62px)", { lineHeight: "1.0", letterSpacing: "-0.035em", fontWeight: "500" }],
        h3: ["clamp(22px,2.4vw,32px)", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "500" }],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
        full: "999px",
      },
      maxWidth: {
        content: "1240px",
        wide: "1480px",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4,0,0.2,1)",
        smooth: "cubic-bezier(0.16,1,0.3,1)",
        expo: "cubic-bezier(0.19,1,0.22,1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "80%,100%": { transform: "scale(2.4)", opacity: "0" },
        },
        /* Three washes drifting on different periods, so the field never
           visibly repeats. Transform-only, so they stay off the main thread. */
        "aurora-a": {
          "0%": { transform: "translate3d(-8%, -6%, 0) scale(1)" },
          "100%": { transform: "translate3d(10%, 8%, 0) scale(1.18)" },
        },
        "aurora-b": {
          "0%": { transform: "translate3d(6%, 4%, 0) scale(1.12)" },
          "100%": { transform: "translate3d(-9%, -10%, 0) scale(1)" },
        },
        "aurora-c": {
          "0%": { transform: "translate3d(0, 8%, 0) scale(1.04)" },
          "100%": { transform: "translate3d(-7%, -5%, 0) scale(1.22)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        "marquee-slow": "marquee 90s linear infinite",
        "marquee-reverse": "marquee-reverse 90s linear infinite",
        "ping-soft": "ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite",
        "aurora-a": "aurora-a 26s cubic-bezier(0.4,0,0.2,1) infinite alternate",
        "aurora-b": "aurora-b 34s cubic-bezier(0.4,0,0.2,1) infinite alternate",
        "aurora-c": "aurora-c 42s cubic-bezier(0.4,0,0.2,1) infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
