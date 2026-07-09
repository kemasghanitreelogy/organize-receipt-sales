import { NextRequest, NextResponse } from "next/server";
import { matchAll, type MatchInput } from "@/app/lib/shopify";

export const runtime = "nodejs";

// Lightweight endpoint: OCR happens in the browser; this only cross-checks the
// extracted recipients against Shopify (needs the secret Admin token). The
// request/response are tiny, so it runs comfortably on any serverless free tier.
export async function POST(req: NextRequest) {
  // Optional access gate: if APP_PASSWORD is set, this endpoint (which can pull
  // customer phone numbers from Shopify) requires a matching password header.
  // Unset = open (e.g. for local use).
  const gate = process.env.APP_PASSWORD;
  if (gate && req.headers.get("x-app-password") !== gate) {
    return NextResponse.json({ error: "Access password required or incorrect." }, { status: 401 });
  }

  let body: { inputs?: MatchInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const inputs = Array.isArray(body?.inputs) ? body.inputs : [];
  if (!inputs.length) return NextResponse.json({ matches: {} });

  try {
    const map = await matchAll(inputs);
    const matches: Record<number, unknown> = {};
    for (const [page, m] of map) matches[page] = m;
    return NextResponse.json({ matches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Shopify lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
