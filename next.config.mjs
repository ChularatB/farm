/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // หรือ domain ที่แกใช้เก็บรูป
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;