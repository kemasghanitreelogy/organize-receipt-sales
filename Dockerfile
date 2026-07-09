# Container image for hosts that allow long-running CPU work and large uploads
# (Railway, Render, Fly.io, a VM…). Unlike Vercel serverless, this has no 4.5MB
# request cap and no short function timeout, so the on-device OCR pipeline
# (pdfjs + @napi-rs/canvas + tesseract.js + zxing) runs to completion.
FROM node:20-bookworm-slim

WORKDIR /app

# Install deps first for better layer caching.
COPY package*.json ./
RUN npm ci

# Build the Next.js app.
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Set STORE_NAME and ADMIN_API_KEY as environment variables on your host.
CMD ["npm", "start"]
