/* eslint-disable @typescript-eslint/no-explicit-any */
// World-class verification engine.
//   render (pdfjs + napi-canvas) -> decode barcodes (zxing) -> thumbnails
//   Barcodes give the tracking number EXACTLY (no OCR error possible), and two
//   barcodes per label cross-confirm each other. Gemini fills the rest; then we
//   reconcile + validate every field and flag anything uncertain for review.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readBarcodes } from "zxing-wasm/reader";
import { createWorker } from "tesseract.js";

export type PageVisual = {
  page: number;
  barcodes: string[]; // all JD-* barcodes decoded on the page
  tracking: string | null; // agreed tracking number from barcodes
  trackingConfirmed: boolean; // >=2 barcodes agree
  thumbnail: string; // data URL (JPEG) of the page for human review
  ocrText?: string; // raw Tesseract text (only when withOcr = true)
};

const JD = /JD\d{8,}/;

async function decodeRegion(
  fullCanvas: any,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  scale: number,
): Promise<string[]> {
  const cw = Math.max(1, Math.round(sw * scale));
  const ch = Math.max(1, Math.round(sh * scale));
  const c = createCanvas(cw, ch);
  const ctx = c.getContext("2d");
  ctx.drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, cw, ch);
  const id = ctx.getImageData(0, 0, cw, ch);
  try {
    const res = await readBarcodes(
      { data: id.data, width: cw, height: ch } as any,
      { formats: ["Code128", "Code39", "ITF", "QRCode", "DataMatrix"], tryHarder: true, maxNumberOfSymbols: 20 },
    );
    return res.map((r: any) => (r.text || "").trim()).filter((t: string) => JD.test(t));
  } catch {
    return [];
  }
}

async function decodePage(fullCanvas: any): Promise<string[]> {
  const W = fullCanvas.width;
  const H = fullCanvas.height;
  const found: string[] = [];
  // The label lives in the top-left ~42% x ~40% of the page. Scan several bands
  // and scales so slight template shifts between pages don't break decoding.
  const regions: [number, number, number, number, number][] = [
    [0.01, 0.045, 0.3, 0.075, 2], // top Code128 band
    [0.0, 0.3, 0.42, 0.08, 2], // bottom Code39 band
    [0.0, 0.0, 0.42, 0.4, 1.5], // whole label, fallback
    [0.0, 0.0, 0.42, 0.4, 1], // whole label, native
  ];
  for (const [rx, ry, rw, rh, scale] of regions) {
    const codes = await decodeRegion(
      fullCanvas,
      Math.round(W * rx),
      Math.round(H * ry),
      Math.round(W * rw),
      Math.round(H * rh),
      scale,
    );
    found.push(...codes);
    // Once we have two agreeing reads we can stop early.
    if (found.length >= 2 && new Set(found).size === 1) break;
  }
  return found;
}

// Barcode + OCR + thumbnail for one rendered page/image canvas.
async function processCanvas(canvas: any, n: number, worker: any, visuals: PageVisual[]) {
  const barcodes = await decodePage(canvas);
  let ocrText: string | undefined;
  if (worker) {
    const { data } = await worker.recognize(canvas.toBuffer("image/png"));
    ocrText = data.text || "";
  }
  const counts = new Map<string, number>();
  for (const b of barcodes) counts.set(b, (counts.get(b) || 0) + 1);
  let tracking: string | null = null;
  let best = 0;
  for (const [val, cnt] of counts) if (cnt > best) ((best = cnt), (tracking = val));
  const trackingConfirmed = best >= 2;

  const tw = 520;
  const th = Math.round((canvas.height / canvas.width) * tw);
  const tc = createCanvas(tw, th);
  tc.getContext("2d").drawImage(canvas, 0, 0, tw, th);
  const thumbnail = `data:image/jpeg;base64,${tc.toBuffer("image/jpeg", 72).toString("base64")}`;

  visuals.push({ page: n, barcodes: [...counts.keys()], tracking, trackingConfirmed, thumbnail, ocrText });
}

// Accepts a PDF or a single image (PNG/JPG/…). PDFs are rendered page-by-page
// (streaming, to bound memory); an image is treated as one page.
export async function renderAndDecode(
  bytes: Buffer,
  opts: { dpi?: number; withOcr?: boolean; mimeType?: string } = {},
): Promise<PageVisual[]> {
  const dpi = opts.dpi ?? 400;
  const isImage = (opts.mimeType || "").startsWith("image/");
  const worker = opts.withOcr ? await createWorker("ind+eng") : null;
  const visuals: PageVisual[] = [];

  try {
    if (isImage) {
      // Load the image and upscale so barcodes/tiny text stay legible — match
      // the ~3400px width the PDF path renders at (400 DPI on a letter page).
      const img = await loadImage(bytes);
      const scale = img.width && img.width < 3400 ? 3400 / img.width : 1;
      const canvas = createCanvas(Math.round(img.width * scale), Math.round(img.height * scale));
      const ictx = canvas.getContext("2d");
      ictx.fillStyle = "#fff";
      ictx.fillRect(0, 0, canvas.width, canvas.height);
      ictx.drawImage(img, 0, 0, canvas.width, canvas.height);
      await processCanvas(canvas, 1, worker, visuals);
    } else {
      const pdf: any = await getDocument({ data: new Uint8Array(bytes) } as any).promise;
      try {
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          const viewport = page.getViewport({ scale: dpi / 72 });
          const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
          await page.render({ canvasContext: canvas.getContext("2d") as any, viewport, canvas }).promise;
          page.cleanup();
          await processCanvas(canvas, n, worker, visuals);
        }
      } finally {
        try {
          if (typeof pdf.destroy === "function") await pdf.destroy();
        } catch {
          /* ignore */
        }
      }
    }
  } finally {
    try {
      if (worker) await worker.terminate();
    } catch {
      /* ignore */
    }
  }
  return visuals;
}

// ---- Field-level reconciliation + validation -------------------------------

export type Field = {
  value: string | null;
  source: "barcode" | "ocr" | "none";
  confidence: "certain" | "high" | "low";
  flag: string | null; // human-readable reason it needs review, or null
};

export type Record = {
  page: number;
  fields: { [k: string]: Field };
  barcodes: string[];
  thumbnail: string;
  needsReview: boolean;
  // Populated by the Shopify matcher (kept separate from OCR fields):
  phoneLast4?: string; // from the label mask, used as a match key
  matchedOrder?: string | null;
  matchReasons?: string[];
};

const FIELD_KEYS = [
  "tracking_number", "order_code", "service_code",
  "recipient_name", "recipient_address", "sender_name", "sender_address",
  "shipping_cost", "weight", "payment_method", "item", "notes", "ship_date",
] as const;

function mkField(value: string | null, source: Field["source"], confidence: Field["confidence"], flag: string | null): Field {
  return { value: value ?? null, source, confidence, flag };
}

// Per-field validators return a flag string if invalid, else null.
function validate(key: string, value: string | null): string | null {
  const v = (value ?? "").trim();
  if (!v) {
    // These fields are essential; missing = review.
    if (["order_code", "recipient_name", "recipient_address", "shipping_cost", "weight"].includes(key))
      return "missing";
    return null;
  }
  switch (key) {
    case "shipping_cost":
      return /\d/.test(v) && /idr|rp/i.test(v) ? null : "unexpected format";
    case "weight":
      return /[\d.]+\s*kg/i.test(v) ? null : "unexpected format";
    case "recipient_address":
      return /\b\d{5}\b/.test(v) ? null : "no 5-digit postcode";
    case "service_code":
      return v.length <= 8 ? null : "unexpected";
    case "recipient_name":
    case "sender_name":
      return /^[A-Za-z][A-Za-z .'-]*$/.test(v) ? null : "contains odd characters";
    default:
      return null;
  }
}

export function reconcile(geminiRows: any[], visuals: PageVisual[]): Record[] {
  const byPage = new Map<number, any>();
  for (const row of geminiRows || []) if (row && typeof row.page === "number") byPage.set(row.page, row);

  return visuals.map((vis) => {
    const row = byPage.get(vis.page) || {};
    const fields: { [k: string]: Field } = {};

    for (const key of FIELD_KEYS) {
      const ocrVal: string | null = row[key] ?? null;

      if (key === "tracking_number") {
        if (vis.tracking) {
          const match = ocrVal && ocrVal.replace(/\s/g, "") === vis.tracking;
          fields[key] = vis.trackingConfirmed
            ? mkField(vis.tracking, "barcode", "certain", match || !ocrVal ? null : "OCR said " + ocrVal)
            : mkField(vis.tracking, "barcode", "high", "single barcode read");
        } else {
          fields[key] = mkField(ocrVal, ocrVal ? "ocr" : "none", "low", "no barcode — verify");
        }
        continue;
      }

      const flag = validate(key, ocrVal);
      const conf: Field["confidence"] = flag ? "low" : ocrVal ? "high" : "high";
      fields[key] = mkField(ocrVal, ocrVal ? "ocr" : "none", conf, flag);
    }

    // Courier from OCR (normalized display); AWB is the barcode-certain tracking.
    const courierRaw: string | null = row.courier ?? null;
    fields["courier"] = mkField(normalizeCourier(courierRaw), courierRaw ? "ocr" : "none", "high", null);
    // Phone slot — filled by the Shopify matcher later; empty for now.
    fields["phone"] = mkField(null, "none", "low", "not matched yet");

    const phoneLast4 = (row.recipient_phone_last4 ?? "").toString().replace(/\D/g, "").slice(-4);

    const needsReview = Object.values(fields).some((f) => f.confidence === "low");
    return {
      page: vis.page,
      fields,
      barcodes: vis.barcodes,
      thumbnail: vis.thumbnail,
      needsReview,
      phoneLast4,
      matchedOrder: null,
      matchReasons: [],
    };
  });
}

function normalizeCourier(raw: string | null): string | null {
  if (!raw) return null;
  const u = raw.toUpperCase();
  if (u.includes("GLOBAL JET") || u.includes("J&T") || /\bJET\b/.test(u)) return "J&T Express";
  if (u.includes("JNE")) return "JNE";
  if (u.includes("SICEPAT")) return "SiCepat";
  if (u.includes("ANTERAJA")) return "AnterAja";
  if (u.includes("NINJA")) return "Ninja Xpress";
  return raw.trim();
}
