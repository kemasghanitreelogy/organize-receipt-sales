import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { runLocalOcr } from "@/app/lib/localOcr";
import { renderAndDecode, reconcile } from "@/app/lib/verify";
import type { PageVisual } from "@/app/lib/verify";
import { matchAll } from "@/app/lib/shopify";
import { parseLabelFields } from "@/app/lib/localExtract";

// Shared verify finalization: reconcile OCR + barcode, cross-check against
// Shopify for the phone, and build the response. Used by both the local
// (Tesseract) and Gemini paths so they behave identically downstream.
async function finalizeVerify(
  visuals: PageVisual[],
  rows: any[],
  model: string,
  started: number,
  usageMeta: any,
) {
  const records = reconcile(rows, visuals);

  const shipDate = rows.find((r) => r?.ship_date)?.ship_date;
  const isoShip = normalizeShipDate(shipDate);
  const inputs = records.map((r) => ({
    page: r.page,
    name: r.fields.recipient_name?.value || "",
    zip: (r.fields.recipient_address?.value || "").match(/\b\d{5}\b/)?.[0] || "",
    phoneLast4: r.phoneLast4 || "",
    shipDate: isoShip,
  }));
  const matches = await matchAll(inputs);

  for (const r of records) {
    const m = matches.get(r.page);
    if (m && m.confidence === "certain") {
      // Confident Shopify match: fill clean contact from the order.
      r.fields.phone = { value: m.phone, source: "ocr", confidence: "certain", flag: null };
      r.matchedOrder = m.orderName;
      r.matchReasons = m.reasons;
      r.matchStatus = "shopify";
      if (m.name) r.fields.recipient_name = { value: m.name, source: "ocr", confidence: "certain", flag: null };
      if (m.address) r.fields.recipient_address = { value: m.address, source: "ocr", confidence: "certain", flag: null };
    } else {
      // No confident match — do NOT surface a misleading guess. Mark it as a
      // manual row (likely a direct/WhatsApp order not in Shopify).
      r.fields.phone = {
        value: null,
        source: "none",
        confidence: "low",
        flag: "Not in Shopify — likely a direct/WhatsApp order. Enter phone manually.",
      };
      r.matchedOrder = null;
      r.matchReasons = [];
      r.matchStatus = "manual";
    }
    r.needsReview = Object.values(r.fields).some((f: any) => f.confidence === "low");
  }

  const reviewCount = records.filter((r) => r.needsReview).length;
  const barcodeConfirmed = records.filter((r) => r.fields.tracking_number?.confidence === "certain").length;
  const phoneMatched = records.filter((r) => r.fields.phone?.confidence !== "low" && r.fields.phone?.value).length;

  return NextResponse.json({
    provider: usageMeta ? "gemini" : "local",
    mode: "verify",
    model,
    records,
    elapsedMs: Date.now() - started,
    pageCount: records.length,
    reviewCount,
    barcodeConfirmed,
    phoneMatched,
    usage: usageMeta
      ? {
          promptTokenCount: usageMeta.promptTokenCount ?? null,
          candidatesTokenCount: usageMeta.candidatesTokenCount ?? null,
          thoughtsTokenCount: usageMeta.thoughtsTokenCount ?? 0,
          totalTokenCount: usageMeta.totalTokenCount ?? null,
        }
      : null,
  });
}

// Labels print ship date as DD-MM-YYYY; normalize to ISO. OCR of the year is
// unreliable (e.g. 2026 → 2626) and the wrong date field can be picked, so we
// reject implausible years and return "" — the matcher then falls back to a
// recent-orders window instead of landing on an empty far-future window.
function normalizeShipDate(raw: string | undefined): string {
  if (raw) {
    const m = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (m) {
      const dd = +m[1], mm = +m[2];
      const yr = m[3].length === 2 ? 2000 + +m[3] : +m[3];
      if (yr >= 2023 && yr <= 2028 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
        return `${yr}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      }
    }
  }
  return "";
}

export const runtime = "nodejs";
export const maxDuration = 300;

// ---- Token-optimal Gemini OCR ----------------------------------------------
// Key optimizations (see README):
//  1. Native PDF input  -> Gemini bills a flat 258 tokens/page, regardless of
//     resolution (pages are internally rasterized up to 3072px). Sending our
//     own hi-res PNGs would tile each page into ~6 tiles (~1548 tok/page) = 6x
//     more expensive. So we forward the raw PDF bytes.
//  2. thinkingBudget: 0 -> OCR is perception, not reasoning. Disabling the
//     "thinking" phase removes thousands of wasted thought tokens.
//  3. Minimal prompt + text/plain output -> no markdown / commentary overhead.
// ---------------------------------------------------------------------------

const TEXT_PROMPT = `You are an exact OCR transcriber. This is a scanned document whose text lives inside images. Transcribe ALL text from EVERY page verbatim, preserving reading order and line breaks.

Rules:
- Output ONLY the transcribed text. No commentary, no explanations, no markdown fences.
- Start each page with a line exactly: ===== PAGE {n} =====  (n = page number, starting at 1)
- Transcribe every page, even if similar to others.
- Preserve numbers, tracking codes, addresses and currency EXACTLY as shown.
- Use [?] for any character you cannot read. Do not summarize, translate or reformat.`;

const STRUCT_PROMPT = `You are a precise data-extraction engine for Indonesian shipping labels / waybills (resi). The document is scanned; text is inside images. For EACH page, extract one shipping-label record. Read numbers, codes and addresses exactly. Use null for any field that is absent or unreadable. Do not invent data. IMPORTANT: next to the recipient (Penerima) there is a masked phone like "****0448" — return its 4 visible trailing digits in recipient_phone_last4 (digits only). Also capture the courier/carrier company name shown on the label.`;

const labelSchema = {
  type: Type.OBJECT,
  properties: {
    page: { type: Type.INTEGER, description: "1-based page number" },
    tracking_number: { type: Type.STRING, nullable: true, description: "The JD... airwaybill number under the barcode" },
    order_code: { type: Type.STRING, nullable: true, description: "The large code at top, e.g. 330-BKI72-03D" },
    service_code: { type: Type.STRING, nullable: true, description: "Top-right service code, e.g. EZ / NP" },
    recipient_name: { type: Type.STRING, nullable: true, description: "Penerima name" },
    recipient_address: { type: Type.STRING, nullable: true },
    recipient_phone_last4: { type: Type.STRING, nullable: true, description: "The 4 visible digits of the masked recipient phone next to Penerima, e.g. from '****0448' return '0448'. Digits only." },
    courier: { type: Type.STRING, nullable: true, description: "The shipping carrier / courier company on the label, e.g. 'PT GLOBAL JET EXPRESS'" },
    sender_name: { type: Type.STRING, nullable: true, description: "Pengirim name" },
    sender_address: { type: Type.STRING, nullable: true },
    shipping_cost: { type: Type.STRING, nullable: true, description: "Biaya Pengiriman, e.g. IDR 24,000" },
    weight: { type: Type.STRING, nullable: true, description: "e.g. 1.00 KG" },
    payment_method: { type: Type.STRING, nullable: true, description: "e.g. TUNAI" },
    item: { type: Type.STRING, nullable: true, description: "Barang, e.g. SUPLEMEN" },
    notes: { type: Type.STRING, nullable: true, description: "e.g. REG" },
    ship_date: { type: Type.STRING, nullable: true },
  },
  required: ["page"],
  propertyOrdering: [
    "page", "tracking_number", "order_code", "service_code",
    "recipient_name", "recipient_address", "recipient_phone_last4", "courier",
    "sender_name", "sender_address",
    "shipping_cost", "weight", "payment_method", "item", "notes", "ship_date",
  ],
};

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  const mode = (form.get("mode") as string) || "text";
  const provider = (form.get("provider") as string) || "gemini";
  const model = ((form.get("model") as string) || "gemini-2.5-flash").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  const isImageUpload = (file.type || "").startsWith("image/") || /\.(png|jpe?g|webp|heic|heif|tiff?)$/i.test(file.name);
  const isPdfUpload = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (file.type && !isPdfUpload && !isImageUpload) {
    return NextResponse.json({ error: "Only PDF or image files are supported." }, { status: 400 });
  }
  const uploadMime = isImageUpload && !isPdfUpload ? (file.type || "image/png") : "application/pdf";
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) {
    return NextResponse.json({ error: "The uploaded PDF is empty." }, { status: 400 });
  }
  if (bytes.length > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: "PDF exceeds the 20MB inline limit. Split it into smaller files." },
      { status: 413 },
    );
  }

  // --- Local + Verify: fully Gemini-free world-class pipeline ---------------
  // barcode (AWB) + Tesseract field parse + fuzzy pool Shopify match.
  if (provider === "local" && mode === "verify") {
    const started = Date.now();
    try {
      const visuals = await renderAndDecode(bytes, { withOcr: true, mimeType: uploadMime });
      const rows = visuals.map((v) => parseLabelFields(v.ocrText || "", v.page));
      return await finalizeVerify(visuals, rows, "tesseract.js + barcode + Shopify", started, null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Local verify failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // --- Local provider (plain text): free, no API key, no quota --------------
  if (provider === "local") {
    const started = Date.now();
    try {
      const result = await runLocalOcr(bytes);
      return NextResponse.json({
        provider: "local",
        mode: "text",
        model: "tesseract.js (ind+eng)",
        text: result.text,
        structured: null,
        elapsedMs: Date.now() - started,
        confidence: result.avgConfidence,
        pageCount: result.pages.length,
        usage: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Local OCR failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // --- Gemini provider ------------------------------------------------------
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
  }
  const ai = new GoogleGenAI({ apiKey });
  const pdfPart = { inlineData: { data: bytes.toString("base64"), mimeType: "application/pdf" } };

  // --- Verify mode (Gemini extraction) --------------------------------------
  if (mode === "verify") {
    const started = Date.now();
    try {
      const [visuals, response] = await Promise.all([
        renderAndDecode(bytes),
        ai.models.generateContent({
          model,
          contents: [pdfPart, STRUCT_PROMPT],
          config: {
            thinkingConfig: { thinkingBudget: 0 },
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: labelSchema },
          },
        }),
      ]);
      let rows: any[] = [];
      try {
        rows = JSON.parse(response.text ?? "[]");
      } catch {
        rows = [];
      }
      return await finalizeVerify(visuals, rows, model, started, response.usageMetadata ?? {});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const started = Date.now();
  try {
    const isStruct = mode === "struct";
    const response = await ai.models.generateContent({
      model,
      contents: [pdfPart, isStruct ? STRUCT_PROMPT : TEXT_PROMPT],
      config: {
        // Token minimization: no "thinking" phase for a perception task.
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0,
        ...(isStruct
          ? {
              responseMimeType: "application/json",
              responseSchema: { type: Type.ARRAY, items: labelSchema },
            }
          : { responseMimeType: "text/plain" }),
      },
    });

    const elapsedMs = Date.now() - started;
    const text = response.text ?? "";
    const usage = response.usageMetadata ?? {};

    let structured: unknown = null;
    if (isStruct) {
      try {
        structured = JSON.parse(text);
      } catch {
        structured = null;
      }
    }

    return NextResponse.json({
      provider: "gemini",
      mode,
      model,
      text,
      structured,
      elapsedMs,
      confidence: null,
      pageCount: null,
      usage: {
        promptTokenCount: usage.promptTokenCount ?? null,
        candidatesTokenCount: usage.candidatesTokenCount ?? null,
        thoughtsTokenCount: usage.thoughtsTokenCount ?? 0,
        totalTokenCount: usage.totalTokenCount ?? null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error calling Gemini.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
