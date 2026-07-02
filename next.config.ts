import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    position: "top-right",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Forwards local frontend /api requests to your local FastAPI backend process
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', 
      },
    ];
  },
};

export default nextConfig;