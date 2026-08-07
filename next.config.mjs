/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // avoid the "multiple lockfiles / inferred workspace root" warning
  outputFileTracingRoot: import.meta.dirname,
  serverExternalPackages: ["@prisma/client"],
  images: {
    // everything is user content, keep the list open but bounded
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "cdn.lemonsqueezy.com" },
      { protocol: "https", hostname: "cdn.buymeacoffee.com" },
      { protocol: "https", hostname: "gravatar.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.BASE_URL ?? "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-openjar-key, x-requested-with" },
          { key: "Access-Control-Expose-Headers", value: "x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset" }
        ]
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

export default nextConfig;
