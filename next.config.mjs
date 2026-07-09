/** @type {import('next').NextConfig} */
const nextConfig = {
  // These ship their own WASM / native binaries and workers — keep them out of
  // the webpack server bundle so they load correctly at runtime.
  serverExternalPackages: ["tesseract.js", "pdfjs-dist", "@napi-rs/canvas"],
  experimental: {
    // Allow larger PDF uploads to Server Actions / route handlers.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
