/** @type {import('next').NextConfig} */
const nextConfig = {
  // OCR runs in the browser; the only server route (/api/match) just calls the
  // Shopify API, so no heavy server externals are needed.
};

export default nextConfig;
