/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["sovo-bucket.s3.ca-central-1.amazonaws.com", "via.placeholder.com"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
