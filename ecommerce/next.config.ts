import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Crucial fix for GitHub Codespaces proxy URL matching
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.app.github.dev",
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;