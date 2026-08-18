import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The previous generated cache is locked by a stale Windows sandbox ACL.
  // Use a clean local build directory; this does not change application behaviour.
  distDir: ".next-local",
};

export default nextConfig;
