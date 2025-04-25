/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add any other configurations here
  // For example, to handle the "import" syntax in nodejs environment:
  experimental: {
    esmExternals: 'loose'
  }
}

export default nextConfig; 