import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.1.225"],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Allow up to 20MB file uploads (larger than validation limit for safety)
    },
  },
  /* config options here */
};

export default nextConfig;
