import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
    optimizePackageImports: [
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "framer-motion",
      "gsap",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    resolveAlias: {
      'three/src/': './node_modules/three/src/',
      'three/examples/': './node_modules/three/examples/',
      'three/build/': './node_modules/three/build/',
      'three': './lib/three-wrapper.ts',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three$': path.resolve(/*turbopackIgnore: true*/ process.cwd(), './lib/three-wrapper.ts'),
    };
    return config;
  },
};

export default nextConfig;
