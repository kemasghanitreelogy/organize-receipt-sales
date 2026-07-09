// Browser-side OCR pipeline — runs entirely on the user's machine (no upload of
// the PDF/photo to any server): pdf.js renders pages, zxing decodes the AWB
// barcode, tesseract.js reads the label, and localExtract parses the fields.
// Only the small extracted text (name/postcode/phone-4) is later sent to the
// server for the Shopify lookup.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { readBarcodes } from "zxing-wasm/reader";
import { createWorker } from "tesseract.js";
import { AWB_RE, type PageVisual } from "./labelCore";
import { parseLabelFields, type ParsedRow } from "./localExtract";

export type Progress = { stage: string; page?: number; total?: number };

let pdfjsPromise: Promise<any> | null = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Self-hosted worker (copied into /public) — no external CDN for the core.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function cropImageData(canvas: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, scale: number): ImageData {
  const cw = Math.max(1, Math.round(sw * scale));
  const ch = Math.max(1, Math.round(sh * scale));
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, cw, ch);
  return ctx.getImageData(0, 0, cw, ch);
}

async function decodeRegion(canvas: HTMLCanvasElement, rx: number, ry: number, rw: number, rh: number, scale: number): Promise<string[]> {
  const W = canvas.width, H = canvas.height;
  const id = cropImageData(canvas, Math.round(W * rx), Math.round(H * ry), Math.round(W * rw), Math.round(H * rh), scale);
  try {
    const res = await readBarcodes(id, {
      formats: ["Code128", "Code39", "ITF", "QRCode", "DataMatrix"],
      tryHarder: true,
      maxNumberOfSymbols: 20,
    });
    return res
      .map((r: any) => (r.text || "").trim())
      .map((t: string) => (t.match(AWB_RE) ? t.match(AWB_RE)![0].toUpperCase() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function decodePage(canvas: HTMLCanvasElement): Promise<string[]> {
  const regions: [number, number, number, number, number][] = [
    [0.01, 0.045, 0.3, 0.075, 2],
    [0.0, 0.3, 0.42, 0.08, 2],
    [0.0, 0.1, 0.72, 0.09, 2],
    [0.0, 0.0, 0.75, 0.55, 1],
    [0.0, 0.0, 0.42, 0.4, 1.5],
    [0.0, 0.0, 0.42, 0.4, 1],
  ];
  const found: string[] = [];
  for (const [rx, ry, rw, rh, scale] of regions) {
    found.push(...(await decodeRegion(canvas, rx, ry, rw, rh, scale)));
    if (found.length >= 2 && new Set(found).size === 1) break;
  }
  return found;
}

function thumbnailOf(canvas: HTMLCanvasElement): string {
  const tw = 520;
  const th = Math.round((canvas.height / canvas.width) * tw);
  const tc = document.createElement("canvas");
  tc.width = tw;
  tc.height = th;
  tc.getContext("2d")!.drawImage(canvas, 0, 0, tw, th);
  return tc.toDataURL("image/jpeg", 0.72);
}

async function loadImageCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image."));
      i.src = url;
    });
    const targetW = Math.min(4400, Math.max(3400, img.naturalWidth));
    const scale = targetW / img.naturalWidth;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function processCanvas(
  canvas: HTMLCanvasElement,
  n: number,
  worker: any,
  visuals: PageVisual[],
  rows: ParsedRow[],
) {
  const barcodes = await decodePage(canvas);
  const { data } = await worker.recognize(canvas);
  const ocrText: string = data.text || "";

  const counts = new Map<string, number>();
  for (const b of barcodes) counts.set(b, (counts.get(b) || 0) + 1);
  let tracking: string | null = null;
  let best = 0;
  for (const [val, cnt] of counts) if (cnt > best) ((best = cnt), (tracking = val));

  visuals.push({
    page: n,
    barcodes: [...counts.keys()],
    tracking,
    trackingConfirmed: best >= 2,
    thumbnail: thumbnailOf(canvas),
  });
  rows.push(parseLabelFields(ocrText, n));
}

export async function extractFromFile(
  file: File,
  onProgress?: (p: Progress) => void,
): Promise<{ visuals: PageVisual[]; rows: ParsedRow[] }> {
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
  const visuals: PageVisual[] = [];
  const rows: ParsedRow[] = [];

  onProgress?.({ stage: "Loading OCR engine" });
  const worker = await createWorker("ind+eng");

  try {
    if (isImage) {
      onProgress?.({ stage: "Reading label", page: 1, total: 1 });
      const canvas = await loadImageCanvas(file);
      await processCanvas(canvas, 1, worker, visuals, rows);
    } else {
      const pdfjs = await getPdfjs();
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      const total = pdf.numPages;
      const scale = 400 / 72;
      for (let n = 1; n <= total; n++) {
        onProgress?.({ stage: "Reading labels", page: n, total });
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        page.cleanup();
        await processCanvas(canvas, n, worker, visuals, rows);
      }
      try {
        if (typeof pdf.destroy === "function") await pdf.destroy();
      } catch {
        /* ignore */
      }
    }
  } finally {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
  }
  return { visuals, rows };
}
