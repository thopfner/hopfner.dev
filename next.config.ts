import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served behind Nginx under /admin.
  basePath: "/admin",
};

export default nextConfig;
