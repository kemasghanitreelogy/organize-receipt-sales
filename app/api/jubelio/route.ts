import { NextRequest, NextResponse } from "next/server";
import { jubelioLogin, findJubelioOrder, writeJubelioAwb } from "@/app/lib/jubelio";

export const runtime = "nodejs";
export const maxDuration = 120;

type Row = { page: number; name: string; legacyId: string; zip: string; awb: string; courier: string; salesorderId?: number };

// mode=preview → dry-run: locate each Jubelio order and report what WOULD be
// written (writes nothing). mode=push → actually write AWB+courier, but only
// after re-confirming ref_no == Shopify legacyId on a fresh fetch.
export async function POST(req: NextRequest) {
  let body: { mode?: string; rows?: Row[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const mode = body.mode === "push" ? "push" : "preview";
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return NextResponse.json({ results: [] });

  let token: string;
  try {
    token = await jubelioLogin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Jubelio login failed." }, { status: 502 });
  }

  const results: any[] = [];

  if (mode === "preview") {
    for (const r of rows) {
      try {
        const f = await findJubelioOrder(token, { name: r.name, legacyId: r.legacyId, zip: r.zip });
        const writable = f.found && f.refMatch && !f.currentTracking && f.picklistExist;
        let status: string;
        if (!f.found) status = f.note;
        else if (f.currentTracking) status = `already has resi ${f.currentTracking}`;
        else if (!f.refMatch) status = "found by name but ref_no not confirmed — verify";
        else if (!f.picklistExist) status = "not processed in Jubelio yet (no picklist) — process the order first";
        else status = "ready to write";
        results.push({
          page: r.page,
          found: f.found,
          salesorderId: f.salesorderId,
          salesorderNo: f.salesorderNo,
          currentTracking: f.currentTracking,
          currentShipper: f.currentShipper,
          refMatch: f.refMatch,
          writable,
          awb: r.awb,
          courier: r.courier,
          status,
        });
      } catch (e) {
        results.push({ page: r.page, found: false, writable: false, status: e instanceof Error ? e.message : "error" });
      }
    }
    return NextResponse.json({ mode, results });
  }

  // push — re-confirm each order before writing, so a stale/incorrect client
  // salesorder_id can never cause a wrong write.
  for (const r of rows) {
    try {
      const f = await findJubelioOrder(token, { name: r.name, legacyId: r.legacyId, zip: r.zip });
      if (!f.found || !f.refMatch || !f.salesorderId) {
        results.push({ page: r.page, ok: false, error: "not confirmed at write time — skipped" });
        continue;
      }
      if (f.currentTracking) {
        results.push({ page: r.page, ok: false, error: `already has resi ${f.currentTracking} — skipped` });
        continue;
      }
      if (!f.picklistExist) {
        results.push({ page: r.page, ok: false, error: "not processed in Jubelio yet (no picklist) — skipped" });
        continue;
      }
      if (!r.awb) {
        results.push({ page: r.page, ok: false, error: "no AWB to write" });
        continue;
      }
      const w = await writeJubelioAwb(token, f.salesorderId, r.awb, r.courier || "");
      results.push({ page: r.page, ok: w.ok, error: w.error, salesorderNo: f.salesorderNo });
    } catch (e) {
      results.push({ page: r.page, ok: false, error: e instanceof Error ? e.message : "error" });
    }
  }
  return NextResponse.json({ mode, results });
}
