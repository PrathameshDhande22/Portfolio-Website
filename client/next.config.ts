import type { NextConfig } from "next";

const mediaOrigin = new URL(process.env.MEDIA_URL ?? "http://localhost:9000");

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  output: "standalone",
  turbopack: { root: __dirname },
  images: {
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
    fetches: { fullUrl: true, hmrRefreshes: true },
    browserToTerminal: "warn",
  },
  async redirects() {
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

export default nextConfig;
