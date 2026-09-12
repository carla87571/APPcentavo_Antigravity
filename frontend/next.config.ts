import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "http://localhost:3002/auth/:path*",
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:3002/api/auth/:path*",
      },
      {
        source: "/transactions/:path*",
        destination: "http://localhost:3001/api/transactions/:path*",
      },
      {
        source: "/transactions",
        destination: "http://localhost:3001/api/transactions",
      },
      {
        source: "/api/transactions/:path*",
        destination: "http://localhost:3001/api/transactions/:path*",
      },
      {
        source: "/api/transactions",
        destination: "http://localhost:3001/api/transactions",
      },
    ];
  },
};

export default nextConfig;
