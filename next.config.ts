import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is per-user (Supabase session cookies), so rendering stays dynamic.
  // Pages visited in the last 30s open instantly from the browser cache; saving, deleting or importing clears it.
  experimental: {
    staleTimes: { dynamic: 30 },
  },
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
