import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Keep Turbopack rooted at the app (where node_modules/next lives).
  // Without this, HMR can infer src/app as the project and panic with
  // "Next.js package not found".
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bmoopzbpnavgoyjjxrwa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Improves styled-components debugging and SSR compatibility with the App Router.
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverActions: {
      // Allow admin media uploads larger than default 1 MB.
      bodySizeLimit: "30mb",
    },
    // Allow larger request bodies through proxy layer.
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
