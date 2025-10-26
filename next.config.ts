import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Ensure eventemitter3 is properly resolved
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "eventemitter3": require.resolve("eventemitter3"),
    };
    
    return config;
  },
};

export default nextConfig;
