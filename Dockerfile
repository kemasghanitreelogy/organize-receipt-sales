# Container image for hosts that allow long-running CPU work and large uploads
# (Hugging Face Spaces, Railway, Render, Fly.io, a VM…). Unlike Vercel
# serverless, this has no 4.5MB request cap and no short function timeout, so the
# on-device OCR pipeline (pdfjs + @napi-rs/canvas + tesseract.js + zxing) runs to
# completion.
#
# Hugging Face Spaces run the container as a non-root user (uid 1000) and expect
# the app to listen on port 7860 — this Dockerfile follows that convention and
# still works on any other container host.
FROM node:20-bookworm-slim

# Non-root user with a writable home (required by HF Spaces).
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    NODE_ENV=production \
    PORT=7860

WORKDIR /home/user/app

# Install deps first for better layer caching.
COPY --chown=user package*.json ./
RUN npm ci

# Build the Next.js app.
COPY --chown=user . .
RUN npm run build

EXPOSE 7860

# Set STORE_NAME and ADMIN_API_KEY as Space secrets / env vars on your host.
CMD ["npm", "start"]
