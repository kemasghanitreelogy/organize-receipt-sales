// Shopify order matcher — resolves each shipping label to a Shopify order and
// returns the recipient's CLEAN contact data (name, phone, address) plus the
// order number. Designed to work from noisy local-OCR input with NO LLM.
//
// Strategy — digit-first, fuzzy, pool-based:
//   1. Fetch a POOL of orders around the ship date (one paginated query).
//   2. Match each label against the pool by three INDEPENDENT signals:
//        • phone last-4  — the label masks the phone as "****1234"; those four
//          digits must equal the order phone's last four (edit-distance ≤1 to
//          tolerate a single OCR slip).
//        • postcode      — 5-digit label postcode vs order zip (edit-distance ≤1).
//        • name overlap  — shared name tokens (robust to trailing OCR garbage).
//   3. A match is "certain" only when TWO independent signals agree — so a wrong
//      single-signal guess can never pass silently.
// This beats name-search because OCR reads digits far more reliably than the
// masked name region, and the confirmed phone/name come back from Shopify itself.

export type MatchResult = {
  phone: string | null;
  name: string | null; // authoritative recipient name from the order
  address: string | null; // authoritative full address from the order
  city: string | null;
  zip: string | null;
  orderName: string | null;
  confidence: "certain" | "high" | "low";
  reasons: string[];
  flag: string | null;
  candidateCount: number;
};

export type MatchInput = {
  page: number;
  name: string;
  zip: string;
  phoneLast4: string;
  shipDate: string; // ISO
};

type PoolOrder = { orderName: string; createdAt: string; shipName: string; address: string; city: string; zip: string; phone: string };

const digits = (s: string | null) => (s || "").replace(/\D/g, "");
const nameTokens = (s: string) =>
  new Set((s || "").toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 3));

function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

// Does the order phone end in the label's last-4 (exact, or 1-edit fuzzy on the
// TAIL only)? Comparing just the last four digits — not any 4-digit window in
// the middle of the number — prevents a coincidental interior match (e.g. label
// "3555" vs a different person's "…3155 88") from looking like a phone hit.
function phoneTail(phone: string, last4: string): "exact" | "fuzzy" | null {
  if (!phone || last4.length < 3) return null;
  const p = digits(phone);
  if (p.length < last4.length) return null;
  if (p.endsWith(last4)) return "exact";
  if (lev(p.slice(-last4.length), last4) <= 1) return "fuzzy";
  return null;
}

const POOL_QUERY = `query Pool($q: String!, $c: String) {
  orders(first: 100, after: $c, query: $q, sortKey: CREATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    edges { node { name createdAt shippingAddress { name address1 city province zip phone } } }
  }
}`;

async function fetchPool(store: string, token: string, shipDate: string): Promise<PoolOrder[]> {
  const from = new Date(+new Date(shipDate) - 30 * 86400000).toISOString().slice(0, 10);
  const to = new Date(+new Date(shipDate) + 10 * 86400000).toISOString().slice(0, 10);
  const q = `created_at:>=${from} created_at:<=${to}`;
  const pool: PoolOrder[] = [];
  let cursor: string | null = null;
  let pages = 0;
  do {
    const res: Response = await fetch(`https://${store}/admin/api/2026-07/graphql.json`, {
      method: "POST",
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ query: POOL_QUERY, variables: { q, c: cursor } }),
    });
    const json: any = await res.json();
    if (json.errors) throw new Error("Shopify: " + JSON.stringify(json.errors));
    const conn = json.data?.orders;
    for (const e of conn?.edges ?? []) {
      const a = e.node.shippingAddress ?? {};
      pool.push({
        orderName: e.node.name,
        createdAt: e.node.createdAt,
        shipName: a.name ?? "",
        address: [a.address1, a.city, a.province, a.zip].filter(Boolean).join(", "),
        city: a.city ?? "",
        zip: digits(a.zip ?? ""),
        phone: a.phone ?? "",
      });
    }
    cursor = conn?.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    pages++;
  } while (cursor && pages < 8);
  return pool;
}

function matchAgainstPool(inp: MatchInput, pool: PoolOrder[]): MatchResult {
  const inTokens = nameTokens(inp.name);
  let best: PoolOrder | null = null;
  let bestScore = -Infinity;
  let bestReasons: string[] = [];

  for (const o of pool) {
    let score = 0;
    const reasons: string[] = [];
    const ph = phoneTail(o.phone, inp.phoneLast4);
    if (ph === "exact") {
      score += 4;
      reasons.push("phone-4 ✓");
    } else if (ph === "fuzzy") {
      score += 3;
      reasons.push("phone-4 ~");
    }
    if (inp.zip && o.zip) {
      if (o.zip === inp.zip) {
        score += 3;
        reasons.push("postcode");
      } else if (lev(o.zip, inp.zip) <= 1) {
        score += 1.5;
        reasons.push("postcode ~");
      }
    }
    const shared = [...inTokens].filter((t) => nameTokens(o.shipName).has(t)).length;
    if (shared >= 2) {
      score += 3;
      reasons.push("name×" + shared);
    } else if (shared === 1) {
      score += 1.5;
      reasons.push("name×1");
    }
    const days = Math.abs((+new Date(o.createdAt) - +new Date(inp.shipDate)) / 86400000);
    if (days <= 4) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = o;
      bestReasons = reasons;
    }
  }

  if (!best || bestScore <= 0) {
    return { phone: null, name: null, address: null, city: null, zip: null, orderName: null, confidence: "low", reasons: [], flag: "no matching order", candidateCount: pool.length };
  }

  const phoneExact = bestReasons.includes("phone-4 ✓");
  const phoneFuzzy = bestReasons.some((r) => r.startsWith("phone-4"));
  const hasZip = bestReasons.some((r) => r.startsWith("postcode"));
  const hasName = bestReasons.some((r) => r.startsWith("name"));

  // If the label DID show a phone last-4 and it does NOT match this order's
  // phone, the order almost certainly belongs to a different person (same name /
  // area, different number) — never call that certain, even with name + zip.
  const phoneContradicts =
    inp.phoneLast4.length >= 3 && !!best.phone && !phoneTail(best.phone, inp.phoneLast4);

  // The recipient NAME is the identity anchor: postcode + fuzzy-phone can
  // coincide for a different person, so a match is only "certain" when the name
  // agrees AND a hard key confirms it — OR when the digit evidence is
  // exceptionally strong (exact phone last-4 AND exact postcode).
  let confidence: MatchResult["confidence"];
  let flag: string | null = null;
  if (phoneContradicts) {
    confidence = "low";
    flag = "phone last-4 differs from this order — verify against label";
  } else if (hasName && phoneFuzzy) {
    // Name + phone last-4 (exact or ≤1 edit): the phone is near-unique → certain.
    confidence = "certain";
  } else if (phoneExact && hasZip) {
    // Exact phone + exact postcode: strong even if the OCR name is garbled.
    confidence = "certain";
  } else if (hasName && hasZip) {
    // Name + postcode but NO phone confirmation. Safe only if it's the unique
    // name-in-that-area — otherwise two same-name neighbours could be confused.
    const dupes = pool.filter((o) => {
      const shared = [...inTokens].filter((t) => nameTokens(o.shipName).has(t)).length;
      return shared >= 1 && !!inp.zip && o.zip === inp.zip;
    }).length;
    if (dupes <= 1) {
      confidence = "certain";
    } else {
      confidence = "low";
      flag = "multiple orders match this name + area — verify against label";
    }
  } else {
    confidence = "low";
    flag = hasName || phoneFuzzy || hasZip ? "single-signal match — verify against label" : "weak match — verify";
  }

  return {
    phone: best.phone || null,
    name: best.shipName || null,
    address: best.address || null,
    city: best.city || null,
    zip: best.zip || null,
    orderName: best.orderName,
    confidence,
    reasons: bestReasons,
    flag,
    candidateCount: pool.length,
  };
}

export async function matchAll(inputs: MatchInput[]): Promise<Map<number, MatchResult>> {
  const store = process.env.STORE_NAME;
  const token = process.env.ADMIN_API_KEY;
  const out = new Map<number, MatchResult>();
  if (!store || !token) {
    for (const i of inputs)
      out.set(i.page, { phone: null, name: null, address: null, city: null, zip: null, orderName: null, confidence: "low", reasons: [], flag: "Shopify not configured", candidateCount: 0 });
    return out;
  }
  const shipDate = inputs.find((i) => i.shipDate)?.shipDate || new Date().toISOString().slice(0, 10);
  let pool: PoolOrder[];
  try {
    pool = await fetchPool(store, token, shipDate);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Shopify error";
    for (const i of inputs)
      out.set(i.page, { phone: null, name: null, address: null, city: null, zip: null, orderName: null, confidence: "low", reasons: [], flag: msg, candidateCount: 0 });
    return out;
  }
  for (const inp of inputs) out.set(inp.page, matchAgainstPool(inp, pool));
  return out;
}
