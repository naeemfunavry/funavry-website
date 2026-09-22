/**
 * In development the CMS API runs on localhost, which Next 16 refuses to fetch
 * images from — see `dangerouslyAllowLocalIP` below.
 */
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Development only, and the name is not hyperbole.
     *
     * Next 16 refuses to optimise an image whose host resolves to a private
     * address, because the optimiser takes a URL and fetches it server-side —
     * so without that check it is an SSRF proxy into whatever network the
     * server sits in. Someone could point it at 169.254.169.254 and read cloud
     * instance credentials.
     *
     * In development the API genuinely is on localhost:4000, so the check has
     * nothing to protect and blocks every CMS image. In production the API is
     * on a real host and this must stay off — which is why it is gated on the
     * environment rather than simply switched on.
     */
    dangerouslyAllowLocalIP: isDev,

    /**
     * Where images may be loaded from.
     *
     * Content images live in the CMS now and are served by the API, so its
     * origin has to be listed — `next/image` refuses a remote host it was not
     * told about, and the refusal is a 500 on the whole page rather than a
     * broken image.
     *
     * Note this only bites for images passed as a URL string. Where the API
     * client builds a StaticImageData-shaped object (the case-study captures,
     * which carry their own dimensions and blur placeholder), Next treats it
     * like a static import and skips this check — which is why the omission
     * showed up on the industry cards before the case-study deck.
     *
     * Set NEXT_PUBLIC_MEDIA_HOST per environment; the localhost entry is for
     * development only.
     */
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],

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
