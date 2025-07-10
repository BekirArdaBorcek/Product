/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Tüm hostname'lere izin ver
      },
      {
        protocol: "http",
        hostname: "**", // HTTP için de izin ver
      },
    ],
  },
};

export default nextConfig;
