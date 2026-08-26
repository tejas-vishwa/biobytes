import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "tesseract.js",
    "tesseract.js-core",
    "unpdf",
    "pdfjs-dist"
  ],
};

export default nextConfig;
