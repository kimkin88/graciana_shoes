import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(__dirname);

function supabaseHostname() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "bmoopzbpnavgoyjjxrwa.supabase.co";
  try {
    return new URL(raw).hostname;
  } catch {
    return "bmoopzbpnavgoyjjxrwa.supabase.co";
  }
}

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
        hostname: supabaseHostname(),
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
      // Local/dev only headroom. Vercel still rejects Server Action bodies around ~4.5MB
      // (FUNCTION_PAYLOAD_TOO_LARGE) — product media must use signed direct uploads.
      bodySizeLimit: "4.5mb",
    },
    proxyClientMaxBodySize: "4.5mb",
  },
};

export default nextConfig;
