import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improves styled-components debugging and SSR compatibility with the App Router.
  compiler: {
    styledComponents: true,
  },
  serverActions: {
    // Allow admin media uploads larger than default 1 MB.
    bodySizeLimit: "8mb",
  },
};

export default nextConfig;
