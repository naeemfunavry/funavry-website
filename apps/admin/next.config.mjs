/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /* The panel is private tooling and is never indexed or linked publicly. */
  poweredByHeader: false,

  images: {
    /* Media is served by the API, so its origin has to be allowed explicitly —
       Next refuses to optimise an image from a host it was not told about. */
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* Nothing in an admin panel needs these. */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
