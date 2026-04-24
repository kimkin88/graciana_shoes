import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
