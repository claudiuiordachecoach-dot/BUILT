import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingExcludes: {
    "*": [".venv/**"],
  },
};

export default nextConfig;
