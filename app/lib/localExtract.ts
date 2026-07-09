// Parse structured label fields from raw Tesseract OCR text — no LLM involved.
// Digits (postcode, phone last-4, cost, weight) OCR reliably and are the fields
// the Shopify matcher leans on; the name is captured best-effort (the matcher
// tolerates OCR noise via token overlap, and clean contact data comes back from
// the matched Shopify order).

export type ParsedRow = {
  page: number;
  order_code: string | null;
  service_code: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  recipient_phone_last4: string | null;
  courier: string | null;
  sender_name: string | null;
  sender_address: string | null;
  shipping_cost: string | null;
  weight: string | null;
  payment_method: string | null;
  item: string | null;
  notes: string | null;
  ship_date: string | null;
};

// Strip leading/trailing single-char OCR noise from a line.
function scrub(line: string): string {
  return line
    .replace(/^[^A-Za-z0-9(]+/, "")
    .replace(/[^A-Za-z0-9).,]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const pick = (re: RegExp, text: string, group = 1): string | null => {
  const m = text.match(re);
  return m ? (m[group] ?? m[0]).trim() : null;
};

// Drop dates whose OCR'd year is implausible (e.g. 2026 → 2626) so the UI never
// shows an obviously wrong date.
function sanitizeDate(d: string | null): string | null {
  if (!d) return null;
  const y = d.match(/(\d{4})\s*$/);
  if (y) {
    const yr = +y[1];
    if (yr < 2023 || yr > 2028) return null;
  }
  return d;
}

// Last 5-digit run that ends at a non-digit boundary → the postcode
// (handles "5117510" → "17510" where a stray barcode digit prefixes it).
function extractZip(addr: string): string | null {
  const matches = [...addr.matchAll(/(\d{5})(?=\D|$)/g)].map((m) => m[1]);
  return matches.length ? matches[matches.length - 1] : null;
}

function normalizeCourier(text: string): string | null {
  const u = text.toUpperCase();
  if (u.includes("LION PARCEL") || u.includes("LIONPARCEL") || /\bLP\d{6,}/.test(u.replace(/\s/g, ""))) return "Lion Parcel";
  if (u.includes("GLOBAL JET") || u.includes("J&T") || /\bJET\b/.test(u)) return "J&T Express";
  if (u.includes("JNE")) return "JNE";
  if (u.includes("SICEPAT")) return "SiCepat";
  if (u.includes("ANTERAJA")) return "AnterAja";
  if (u.includes("NINJA")) return "Ninja Xpress";
  if (u.includes("SAP EXPRESS")) return "SAP Express";
  return null;
}

export function parseLabelFields(rawText: string, page: number): ParsedRow {
  const lines = rawText.split("\n").map(scrub).filter(Boolean);
  const flat = lines.join(" ");

  // Recipient block. Handles both templates:
  //   • J&T   — "Penerima: NAME ****1234" then address on following lines.
  //   • Lion  — "PENERIMA: NAME ****1234, full address … 15419" on one line.
  // We build a block from the Penerima line + following lines up to a boundary,
  // then split it at the masked phone: name is before, address is after.
  const penIdx = lines.findIndex((l) => /penerima/i.test(l));
  let recipient_name: string | null = null;
  let recipient_address: string | null = null;
  let recipient_phone_last4: string | null = null;

  if (penIdx >= 0) {
    // The masked phone sits on the "Penerima" line itself (right after the name)
    // for both templates — so look for it there only, never in later address
    // lines (whose house numbers / postcodes would otherwise be mistaken for it).
    const penLine = lines[penIdx].replace(/.*penerima\s*:?/i, "").trim();
    const pm = penLine.match(/\d{3,4}/);
    if (pm) recipient_phone_last4 = pm[0].slice(-4);

    // Name = penLine text before the mask ("****" or the first digit group).
    // Only drop a trailing token as mask-noise when the mask was OCR'd as a word
    // (no visible "****") — otherwise a genuine 3-word name would lose its last
    // word.
    const hadStars = /\*{2,}/.test(penLine);
    let nm = penLine.split(/\*{2,}|\d{3,4}/)[0];
    const parts = nm.split(/\s+/).filter(Boolean);
    if (parts.length >= 3 && !hadStars) parts.pop();
    nm = parts.join(" ").replace(/[^A-Za-z .'-]/g, "").replace(/\s+/g, " ").trim();
    recipient_name = nm || null;

    // Address = (rest of the Penerima line after the phone, for Lion's one-line
    // format) + following lines (J&T's wrapped address), up to a boundary.
    const addrParts: string[] = [];
    if (pm) {
      const after = penLine.slice(penLine.indexOf(pm[0]) + pm[0].length);
      if (after.replace(/[\s,*.-]/g, "")) addrParts.push(after);
    }
    for (let i = penIdx + 1; i < lines.length && addrParts.length < 6; i++) {
      if (/pengirim|biaya|total|syarat|bayar|kota tujuan|lacak|estimasi|dibuat|berat|lebih praktis|ditagihkan/i.test(lines[i]))
        break;
      addrParts.push(lines[i]);
    }
    recipient_address =
      addrParts
        .join(", ")
        .replace(/\d+\s*x\s*\d+\s*x\s*\d+\s*cm/gi, "")
        .replace(/\bCW\s*:?\s*[\d.]+\s*kg/gi, "")
        .replace(/\b[\d.]+\s*kg\b/gi, "")
        .replace(/\b\d+\s*\/\s*\d+\b/g, "")
        .replace(/^[\s,*.-]+/, "")
        .replace(/[\s,]+$/, "")
        .replace(/(,\s*)+/g, ", ")
        .replace(/\s+/g, " ")
        .trim() || null;
  }

  // Sender (Pengirim) — usually TREELOGY; capture for completeness.
  const sengIdx = lines.findIndex((l) => /pengirim/i.test(l));
  let sender_name: string | null = null;
  if (sengIdx >= 0) {
    sender_name = lines[sengIdx]
      .replace(/.*pengirim\s*:?/i, "")
      .replace(/\s*\S*\d{2,4}\s*$/, "")
      .replace(/[^A-Za-z .'-]/g, "")
      .replace(/\s+/g, " ")
      .trim() || null;
  }

  return {
    page,
    order_code: pick(/\b(\d{3}-[A-Z0-9]{3,}-[A-Z0-9]{2,})\b/i, flat),
    service_code: pick(/\b(EZ|NP|REG|EZBIG)\b/, flat),
    recipient_name,
    recipient_address,
    recipient_phone_last4,
    courier: normalizeCourier(flat),
    sender_name,
    sender_address: null,
    shipping_cost: pick(/((?:IDR|Rp)\s*[\d.,]+)/i, flat),
    weight: pick(/([\d.]+\s*KG)/i, flat),
    payment_method: pick(/\b(TUNAI|NON TUNAI|COD)\b/i, flat),
    item: pick(/Barang\s*:?\s*([A-Za-z]+(?:\s[A-Za-z]+)?)/i, flat),
    notes: pick(/Notes?\s*:?\s*([A-Za-z]{2,})/i, flat),
    ship_date: sanitizeDate(
      pick(/(?:Ship|Cetak|Dibuat)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, flat) ||
        pick(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})/, flat),
    ),
  };
}

// Expose the postcode helper for the matcher.
export { extractZip };
