// Jubelio client — finds the Jubelio sales order that corresponds to a resi and
// writes its AWB (No. Resi) + courier. Server-side only (uses the API password).
//
// Matching is EXACT, not fuzzy: a Jubelio order synced from Shopify has
// `ref_no` == the Shopify order's numeric legacyResourceId and `source_name`
// == "SHOPIFY". So we take the (already world-class) resi→Shopify match, then
// confirm the Jubelio order by ref_no. There is no ref_no search endpoint, so we
// surface candidates by recipient name from the "ready-to-process" WMS list and
// confirm each via GET /sales/orders/{id}.
/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE = "https://api2.jubelio.com";

export type JubelioFind = {
  found: boolean;
  salesorderId: number | null;
  salesorderNo: string | null;
  currentTracking: string | null;
  currentShipper: string | null;
  refMatch: boolean;
  zipMatch: boolean;
  picklistExist: boolean; // save-airwaybill only works once the order has a picklist
  note: string;
};

async function jfetch(token: string, path: string, init?: RequestInit): Promise<Response> {
  // One retry on 429 (Jubelio: 600 req/min).
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(BASE + path, {
      ...init,
      headers: { Authorization: token, "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return fetch(BASE + path, { ...init, headers: { Authorization: token, "Content-Type": "application/json", ...(init?.headers || {}) } });
}

export async function jubelioLogin(): Promise<string> {
  const email = process.env.JUBELIO_API_USERNAME;
  const password = process.env.JUBELIO_API_PASSWORD;
  if (!email || !password) throw new Error("Jubelio credentials not configured (JUBELIO_API_USERNAME / JUBELIO_API_PASSWORD).");
  const res = await fetch(BASE + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json?.token) throw new Error("Jubelio login failed: " + (json?.message || res.status));
  return json.token as string;
}

const digits = (s: any) => String(s ?? "").replace(/\D/g, "");
const norm = (s: any) => String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Lists (in order) where an order awaiting its AWB is likely to appear.
const CANDIDATE_LISTS = [
  "/wms/sales/orders/ready-to-process/",
  "/wms/sales/orders/ready-to-pick/",
  "/wms/sales/order/ready-to-ship",
  "/sales/orders/completed/",
];

// Find the Jubelio order for a Shopify legacyId, surfacing candidates by name.
export async function findJubelioOrder(
  token: string,
  opts: { name: string; legacyId: string; zip: string },
): Promise<JubelioFind> {
  const seen = new Set<number>();
  const candidateIds: number[] = [];
  const nameQ = opts.name.trim();
  if (nameQ) {
    for (const list of CANDIDATE_LISTS) {
      try {
        const res = await jfetch(token, `${list}?q=${encodeURIComponent(nameQ)}&pageSize=20`);
        if (!res.ok) continue;
        const j: any = await res.json();
        for (const it of j.data || j.rows || []) {
          const id = Number(it.salesorder_id);
          if (id && !seen.has(id)) {
            seen.add(id);
            candidateIds.push(id);
          }
        }
      } catch {
        /* try next list */
      }
      if (candidateIds.length >= 15) break;
    }
  }

  if (!candidateIds.length) {
    return { found: false, salesorderId: null, salesorderNo: null, currentTracking: null, currentShipper: null, refMatch: false, zipMatch: false, picklistExist: false, note: "no candidate in Jubelio (name not in open orders)" };
  }

  // Confirm each candidate by ref_no == legacyId (exact) + source SHOPIFY.
  for (const id of candidateIds) {
    try {
      const res = await jfetch(token, `/sales/orders/${id}`);
      if (!res.ok) continue;
      const o: any = await res.json();
      const refMatch = !!opts.legacyId && String(o.ref_no) === String(opts.legacyId);
      const isShopify = String(o.source_name || "").toUpperCase() === "SHOPIFY";
      if (refMatch && isShopify) {
        const zipMatch = !!opts.zip && digits(o.shipping_post_code) === digits(opts.zip);
        return {
          found: true,
          salesorderId: id,
          salesorderNo: o.salesorder_no ?? null,
          currentTracking: o.tracking_no || o.tracking_number || null,
          currentShipper: o.shipper || null,
          refMatch: true,
          zipMatch,
          picklistExist: !!o.picklist_exist,
          note: "matched by ref_no",
        };
      }
    } catch {
      /* next candidate */
    }
  }

  // Fallback: exactly one candidate whose recipient name matches strongly and,
  // if we have zip, its postcode matches — accept but mark ref-unconfirmed.
  if (candidateIds.length === 1) {
    try {
      const res = await jfetch(token, `/sales/orders/${candidateIds[0]}`);
      if (res.ok) {
        const o: any = await res.json();
        const nm = norm(o.shipping_full_name) || norm(o.customer_name);
        const sameName = nm && norm(opts.name) && (nm.includes(norm(opts.name)) || norm(opts.name).includes(nm));
        const zipMatch = !!opts.zip && digits(o.shipping_post_code) === digits(opts.zip);
        if (sameName && zipMatch) {
          return {
            found: true,
            salesorderId: candidateIds[0],
            salesorderNo: o.salesorder_no ?? null,
            currentTracking: o.tracking_no || o.tracking_number || null,
            currentShipper: o.shipper || null,
            refMatch: false,
            zipMatch: true,
            picklistExist: !!o.picklist_exist,
            note: "matched by name + postcode (ref_no not confirmed)",
          };
        }
      }
    } catch {
      /* ignore */
    }
  }

  return { found: false, salesorderId: null, salesorderNo: null, currentTracking: null, currentShipper: null, refMatch: false, zipMatch: false, picklistExist: false, note: "candidates found but none matched ref_no/postcode" };
}

// Write AWB + courier to a Jubelio sales order.
export async function writeJubelioAwb(
  token: string,
  salesorderId: number,
  trackingNo: string,
  shipper: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await jfetch(token, "/sales/orders/save-airwaybill/", {
    method: "POST",
    body: JSON.stringify({ salesorder_id: salesorderId, tracking_no: trackingNo, shipper }),
  });
  if (res.ok) return { ok: true };
  const j: any = await res.json().catch(() => ({}));
  const msg = j?.message || `HTTP ${res.status}`;
  if (/picklist/i.test(msg)) return { ok: false, error: "order belum diproses di Jubelio (belum ada picklist)" };
  return { ok: false, error: msg };
}
