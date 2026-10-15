import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is per-user (Supabase session cookies), so rendering stays dynamic.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
