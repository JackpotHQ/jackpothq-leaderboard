/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.botrix.live",
      },
    ],
  },
};

module.exports = nextConfig;
