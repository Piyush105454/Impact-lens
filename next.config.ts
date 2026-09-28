import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // jsPDF pulls optional browser-only deps; keep it external on the server.
  serverExternalPackages: ["jspdf"],
};

export default nextConfig;
