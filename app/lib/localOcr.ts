/* eslint-disable @typescript-eslint/no-explicit-any */
// Fully local, free OCR pipeline — no API, no quota, no key.
//   pdfjs-dist + @napi-rs/canvas  -> rasterize each PDF page to PNG
//   tesseract.js (ind+eng)        -> OCR each page in Node (WASM)
// Everything here is an npm package; nothing calls out to a paid service.
// NOTE: pdfjs-dist's legacy build ships minimal .d.ts, so the pdf handles are
// typed loosely here — the methods used all exist at runtime.

import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

export type LocalPage = { page: number; text: string; confidence: number };
export type LocalResult = { pages: LocalPage[]; text: string; avgConfidence: number };

// Drop OCR junk: the vertical barcode side-text and decorative banners render as
// short symbol-only lines ("Lu) Lu)", "g g", "Q Q"). Keep lines with real content.
function cleanLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const alnum = (trimmed.match(/[A-Za-z0-9]/g) || []).length;
  if (alnum < 3) return false; // mostly symbols / noise
  const ratio = alnum / trimmed.length;
  if (trimmed.length > 4 && ratio < 0.4) return false; // symbol soup
  return true;
}

function cleanText(raw: string): string {
  return raw
    .split("\n")
    .filter(cleanLine)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

async function renderPageToPng(pdf: any, pageNum: number, dpi: number): Promise<Buffer> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: dpi / 72 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx as any, viewport, canvas }).promise;
  page.cleanup();
  return canvas.toBuffer("image/png");
}

export async function runLocalOcr(pdfBytes: Buffer, dpi = 300): Promise<LocalResult> {
  const data = new Uint8Array(pdfBytes);
  const pdf: any = await getDocument({ data } as any).promise;
  const numPages: number = pdf.numPages;

  const worker = await createWorker("ind+eng");
  const pages: LocalPage[] = [];
  try {
    for (let n = 1; n <= numPages; n++) {
      const png = await renderPageToPng(pdf, n, dpi);
      const { data: ocr } = await worker.recognize(png);
      pages.push({
        page: n,
        text: cleanText(ocr.text || ""),
        confidence: Math.round(ocr.confidence || 0),
      });
    }
  } finally {
    // Best-effort cleanup — never let teardown discard successful OCR results.
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
    try {
      if (typeof pdf.destroy === "function") await pdf.destroy();
      else if (typeof pdf.cleanup === "function") await pdf.cleanup();
    } catch {
      /* ignore */
    }
  }

  const text = pages.map((p) => `===== PAGE ${p.page} =====\n${p.text}`).join("\n\n");
  const avgConfidence = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.confidence, 0) / pages.length)
    : 0;
  return { pages, text, avgConfidence };
}
