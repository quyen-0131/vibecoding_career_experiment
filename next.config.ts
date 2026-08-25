import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The previous generated cache is locked by a stale Windows sandbox ACL.
  // Keep the clean local directory on Windows, but use the standard
  // output directory when Vercel builds the deployed application.
  distDir: process.env.VERCEL ? ".next" : ".next-local",
};

export default nextConfig;
