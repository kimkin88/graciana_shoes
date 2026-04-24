import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improves styled-components debugging and SSR compatibility with the App Router.
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
