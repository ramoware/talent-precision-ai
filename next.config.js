/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove the experimental.appDir option entirely since it's deprecated
  // The App Router is now stable and enabled by default in Next.js 13+
}

module.exports = nextConfig