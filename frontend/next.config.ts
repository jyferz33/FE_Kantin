import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ukk-p2.smktelkom-mlg.sch.id",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
