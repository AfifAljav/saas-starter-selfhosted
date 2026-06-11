import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  experimental: {
    // Enable React Server Components optimizations
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  images: {
    remotePatterns: [
      // GitHub avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Google avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Gravatar
      { protocol: "https", hostname: "www.gravatar.com" },
    ],
  },

  // Bundle analyzer support — set ANALYZE=true to generate report
  ...(process.env.ANALYZE === "true"
    ? {
        webpack(config: any) {
          return config;
        },
      }
    : {}),
};

export default nextConfig;
