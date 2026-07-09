// Pure label logic — NO Node/browser-specific deps, so it runs in the browser
// bundle and (if ever needed) on the server. Rendering/OCR lives elsewhere.

export type Field = {
  value: string | null;
  source: "barcode" | "shopify" | "ocr" | "none";
  confidence: "certain" | "high" | "low";
  flag: string | null;
};

export type PageVisual = {
  page: number;
  barcodes: string[];
  tracking: string | null;
  trackingConfirmed: boolean;
  thumbnail: string;
};

export type LabelRecord = {
  page: number;
  fields: { [k: string]: Field };
  barcodes: string[];
  thumbnail: string;
  needsReview: boolean;
  phoneLast4?: string;
  matchedOrder?: string | null;
  matchReasons?: string[];
  matchStatus?: "shopify" | "manual" | null;
};

// Known airwaybill formats — J&T (JD…), Lion Parcel (…LP…). Extend as needed.
export const AWB_RE = /(JD\d{8,}|\d{0,3}LP\d{8,})/i;

const FIELD_KEYS = [
  "tracking_number", "order_code", "service_code",
  "recipient_name", "recipient_address", "sender_name", "sender_address",
  "shipping_cost", "weight", "payment_method", "item", "notes", "ship_date",
] as const;

function mkField(value: string | null, source: Field["source"], confidence: Field["confidence"], flag: string | null): Field {
  return { value: value ?? null, source, confidence, flag };
}

function validate(key: string, value: string | null): string | null {
  const v = (value ?? "").trim();
  // Deliverable is Courier · AWB · Phone. AWB is barcode-certain, the phone
  // drives review via the Shopify match, so secondary OCR fields never force a
  // review — they vary by courier.
  if (!v && key === "recipient_name") return "missing";
  return null;
}

export function normalizeCourier(raw: string | null): string | null {
  if (!raw) return null;
  const u = raw.toUpperCase();
  if (u.includes("LION PARCEL") || u.includes("LIONPARCEL") || /\bLP\d{6,}/.test(u.replace(/\s/g, ""))) return "Lion Parcel";
  if (u.includes("GLOBAL JET") || u.includes("J&T") || /\bJET\b/.test(u)) return "J&T Express";
  if (u.includes("JNE")) return "JNE";
  if (u.includes("SICEPAT")) return "SiCepat";
  if (u.includes("ANTERAJA")) return "AnterAja";
  if (u.includes("NINJA")) return "Ninja Xpress";
  if (u.includes("SAP EXPRESS")) return "SAP Express";
  return raw.trim();
}

// Merge parsed OCR rows with barcode visuals into review records.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reconcile(rows: any[], visuals: PageVisual[]): LabelRecord[] {
  const byPage = new Map<number, any>();
  for (const row of rows || []) if (row && typeof row.page === "number") byPage.set(row.page, row);

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
      const conf: Field["confidence"] = flag ? "low" : "high";
      fields[key] = mkField(ocrVal, ocrVal ? "ocr" : "none", conf, flag);
    }

    const courierRaw: string | null = row.courier ?? null;
    fields["courier"] = mkField(normalizeCourier(courierRaw), courierRaw ? "ocr" : "none", "high", null);
    fields["phone"] = mkField(null, "none", "low", "not matched yet");

    const phoneLast4 = (row.recipient_phone_last4 ?? "").toString().replace(/\D/g, "").slice(-4);
    const needsReview = Object.values(fields).some((f) => f.confidence === "low");
    return { page: vis.page, fields, barcodes: vis.barcodes, thumbnail: vis.thumbnail, needsReview, phoneLast4, matchedOrder: null, matchReasons: [] };
  });
}
