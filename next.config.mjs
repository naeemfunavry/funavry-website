/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Next re-encodes every image it serves, and its default quality is 75.
     * That is a sensible default for photography and a poor one here: the case
     * studies are dashboards, and what q=75 spends its bit budget on first is
     * exactly the 10px table text those screenshots exist to show. Measured
     * against the crop script's own q90 output, the q=75 re-encode lands at
     * 39.2dB PSNR — the edge of the band where compression starts showing on
     * fine type, and part of why the captures read soft.
     *
     * Next 16 will only serve a quality listed here — anything else 400s — so
     * `quality={90}` at the call site needs 90 on this list to work at all.
     * 75 stays for everything that hasn't asked for better.
     */
    qualities: [75, 90],
  },
};

export default nextConfig;
