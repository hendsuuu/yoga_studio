import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ui-avatars.com" }],
  },
  async rewrites() {
    return [
      {
        source: "/audio/:filename*",
        destination: "/api/audio/:filename*",
      },
    ];
  },
};

export default nextConfig;
