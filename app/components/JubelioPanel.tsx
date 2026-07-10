"use client";

import { useMemo, useState } from "react";
import type { VerifyRecord } from "./ReviewPanel";

type PreviewRow = {
  page: number;
  found: boolean;
  salesorderId: number | null;
  salesorderNo: string | null;
  currentTracking: string | null;
  refMatch: boolean;
  writable: boolean;
  awb: string;
  courier: string;
  status: string;
};

type PushRow = { page: number; ok: boolean; error?: string; salesorderNo?: string };

type JInput = { page: number; name: string; legacyId: string; zip: string; awb: string; courier: string };

export default function JubelioPanel({ records }: { records: VerifyRecord[] }) {
  const [preview, setPreview] = useState<Record<number, PreviewRow> | null>(null);
  const [pushed, setPushed] = useState<Record<number, PushRow>>({});
  const [busy, setBusy] = useState<"" | "preview" | "push">("");
  const [error, setError] = useState<string | null>(null);

  // Only Shopify-matched rows with a barcode AWB can be pushed to Jubelio.
  const inputs = useMemo<JInput[]>(
    () =>
      records
        .filter((r) => r.matchStatus === "shopify" && r.legacyId && r.fields.tracking_number?.value)
        .map((r) => ({
          page: r.page,
          name: r.fields.recipient_name?.value || "",
          legacyId: r.legacyId || "",
          zip: (r.fields.recipient_address?.value || "").match(/\b\d{5}\b/)?.[0] || "",
          awb: r.fields.tracking_number?.value || "",
          courier: r.fields.courier?.value || "",
        })),
    [records],
  );

  const recByPage = useMemo(() => {
    const m: Record<number, VerifyRecord> = {};
    for (const r of records) m[r.page] = r;
    return m;
  }, [records]);

  const runPreview = async () => {
    setBusy("preview");
    setError(null);
    setPushed({});
    try {
      const res = await fetch("/api/jubelio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "preview", rows: inputs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed.");
      const map: Record<number, PreviewRow> = {};
      for (const r of data.results as PreviewRow[]) map[r.page] = r;
      setPreview(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed.");
    } finally {
      setBusy("");
    }
  };

  const writableInputs = useMemo(
    () => (preview ? inputs.filter((i) => preview[i.page]?.writable) : []),
    [preview, inputs],
  );

  const runPush = async () => {
    if (!writableInputs.length) return;
    setBusy("push");
    setError(null);
    try {
      const res = await fetch("/api/jubelio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "push", rows: writableInputs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Push failed.");
      const map: Record<number, PushRow> = {};
      for (const r of data.results as PushRow[]) map[r.page] = r;
      setPushed(map);
      // Jubelio processes the AWB asynchronously, so wait a few seconds before
      // re-reading — otherwise the order may still show its old (empty) state.
      setTimeout(() => runPreview(), 6000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Push failed.");
    } finally {
      setBusy("");
    }
  };

  if (!inputs.length) return null;

  const writableCount = writableInputs.length;

  return (
    <div className="card">
      <div className="review-summary">
        <div>
          <strong>Sync to Jubelio</strong> — write courier + AWB (No. Resi) into the matching Jubelio
          order. {inputs.length} Shopify-matched label{inputs.length === 1 ? "" : "s"} eligible.
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button className="ghost" onClick={runPreview} disabled={!!busy}>
            {busy === "preview" ? "Checking…" : "Preview"}
          </button>
          <button className="primary" onClick={runPush} disabled={!!busy || !writableCount} style={{ padding: "8px 16px" }}>
            {busy === "push" ? "Writing…" : `Push ${writableCount} to Jubelio`}
          </button>
        </div>
      </div>

      {error && <div className="error">⚠ {error}</div>}

      {preview && (
        <div className="table-scroll" style={{ marginTop: 8 }}>
          <table className="grid">
            <thead>
              <tr>
                <th>Pg</th>
                <th>Penerima</th>
                <th>Courier</th>
                <th>AWB / Resi</th>
                <th>Jubelio SO</th>
                <th>Current resi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inputs.map((i) => {
                const p = preview[i.page];
                const done = pushed[i.page];
                const cls = done?.ok ? "good" : p?.writable ? "good" : p?.found ? "warn" : "";
                return (
                  <tr key={i.page}>
                    <td>{i.page}</td>
                    <td>{recByPage[i.page]?.fields.recipient_name?.value || ""}</td>
                    <td>{i.courier}</td>
                    <td style={{ fontFamily: "ui-monospace, monospace" }}>{i.awb}</td>
                    <td>{p?.salesorderNo || (p?.found ? p?.salesorderId : "—")}</td>
                    <td>{p?.currentTracking || "—"}</td>
                    <td className={cls}>
                      {done ? (done.ok ? "✓ written" : `✗ ${done.error}`) : p?.status || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="note" style={{ marginTop: 10 }}>
        Matching is exact: each Jubelio order is confirmed by <code>ref_no</code> = the Shopify order
        id, and orders that already have a resi are never overwritten. Preview shows what will be
        written; nothing is sent to Jubelio until you press Push.
      </p>
    </div>
  );
}
