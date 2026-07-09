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

// Last 5-digit run that ends at a non-digit boundary → the postcode
// (handles "5117510" → "17510" where a stray barcode digit prefixes it).
function extractZip(addr: string): string | null {
  const matches = [...addr.matchAll(/(\d{5})(?=\D|$)/g)].map((m) => m[1]);
  return matches.length ? matches[matches.length - 1] : null;
}

function normalizeCourier(text: string): string | null {
  const u = text.toUpperCase();
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

  // Recipient block: from the "Penerima" line up to "Pengirim"/"BIAYA".
  const penIdx = lines.findIndex((l) => /penerima/i.test(l));
  let recipient_name: string | null = null;
  let recipient_address: string | null = null;
  let recipient_phone_last4: string | null = null;

  if (penIdx >= 0) {
    const penLine = lines[penIdx].replace(/.*penerima\s*:?/i, "").trim();
    const digitGroups = penLine.match(/\d{3,4}/g);
    if (digitGroups) recipient_phone_last4 = digitGroups[digitGroups.length - 1].slice(-4);
    // Name = penLine minus the trailing "<mask-token> <digits>" tail.
    let nm = penLine.replace(/\s*\S*\d{2,4}\s*$/, "").trim();
    // Drop one trailing ALL-CAPS-noise token (OCR of the "****" mask) if the
    // name still has 3+ tokens — real recipient names here are 1–2 words.
    const parts = nm.split(/\s+/);
    if (parts.length >= 3) parts.pop();
    nm = parts.join(" ").replace(/[^A-Za-z .'-]/g, "").replace(/\s+/g, " ").trim();
    recipient_name = nm || null;

    const addrLines: string[] = [];
    for (let i = penIdx + 1; i < lines.length; i++) {
      if (/pengirim|biaya|syarat|bayar|lebih praktis/i.test(lines[i])) break;
      addrLines.push(lines[i]);
    }
    recipient_address = addrLines.join(", ").replace(/\s+/g, " ").trim() || null;
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
    shipping_cost: pick(/(IDR\s*[\d.,]+)/i, flat),
    weight: pick(/([\d.]+\s*KG)/i, flat),
    payment_method: pick(/\b(TUNAI|NON TUNAI|COD)\b/i, flat),
    item: pick(/Barang\s*:?\s*([A-Za-z][A-Za-z ]+)/i, flat),
    notes: pick(/Notes?\s*:?\s*([A-Za-z]{2,})/i, flat),
    ship_date: pick(/(?:Ship|Cetak)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i, flat) || pick(/(\d{2}-\d{2}-\d{4})/, flat),
  };
}

// Expose the postcode helper for the matcher.
export { extractZip };
