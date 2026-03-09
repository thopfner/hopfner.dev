import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : ""

const supabaseProtocol = supabaseUrl
  ? (new URL(supabaseUrl).protocol.replace(":", "") as "http" | "https")
  : "https"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: supabaseProtocol, hostname: supabaseHostname, pathname: "/storage/**" }]
      : [],
  },
};

export default nextConfig;
