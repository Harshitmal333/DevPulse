/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker/Kubernetes image (copies a minimal server into .next/standalone)
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
