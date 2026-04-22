import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9199" 
      } satisfies RemotePattern,
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9199"
      } satisfies RemotePattern
    ]
  }
};

export default nextConfig;
