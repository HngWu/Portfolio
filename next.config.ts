import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
      'three$': path.resolve(process.cwd(), './lib/three-wrapper.ts'),
    };
    return config;
  },
};

export default nextConfig;
