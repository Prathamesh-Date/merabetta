import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the development badge from covering the mobile Home button.
  devIndicators: false,
  // The aggregated provider catalog may take up to two minutes.
  experimental: { proxyTimeout: 125_000 },
  // Proxy only the fixed customer API. Cookies stay on the website origin.
  async rewrites() {
    const value = process.env.CUSTOMER_API_ORIGIN?.trim();
    if (!value) return [];
    const origin = new URL(value);
    if (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password) throw new Error("CUSTOMER_API_ORIGIN must be an HTTP(S) origin without a path.");
    return [{ source: "/api/app/:path*", destination: `${origin.origin}/api/app/:path*` }];
  },
};

export default nextConfig;
