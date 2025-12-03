/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/proxy-image", // Cho phép gọi proxy-image với query
      },
    ],
  },
};

module.exports = nextConfig;
