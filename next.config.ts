import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": [".venv/**"],
  },
};

export default nextConfig;
