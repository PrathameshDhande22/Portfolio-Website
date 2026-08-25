import type { NextConfig } from "next";

const mediaOrigin = new URL(process.env.MEDIA_URL ?? "http://localhost:9000");

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  turbopack: { root: __dirname },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: mediaOrigin.protocol === "https:" ? "https" : "http",
        hostname: mediaOrigin.hostname,
        port: mediaOrigin.port,
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
  logging: {
    incomingRequests: true,
    serverFunctions: true,
    fetches: { fullUrl: true, hmrRefreshes: true },
    browserToTerminal: "warn",
  },
  async redirects() {
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

export default nextConfig;
