/* Twitter uses the same card as Open Graph. The render function is shared; the
   route-segment config below must be declared here directly — Next parses these
   at compile time and can't follow a re-export. */
export { default } from "./opengraph-image";

export const runtime = "nodejs";
export const alt = "Funavry Technologies — Build. Automate. Operate.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
