"use client";

import { useMemo, useState } from "react";

export type Field = {
  value: string | null;
  source: "barcode" | "ocr" | "none";
  confidence: "certain" | "high" | "low";
  flag: string | null;
};

export type VerifyRecord = {
  page: number;
  fields: { [k: string]: Field };
  barcodes: string[];
  thumbnail: string;
  needsReview: boolean;
  matchedOrder?: string | null;
  matchReasons?: string[];
  matchStatus?: "shopify" | "manual" | null;
};

const COLUMNS: { key: string; label: string }[] = [
  { key: "courier", label: "Courier" },
  { key: "tracking_number", label: "AWB / Resi" },
  { key: "phone", label: "No. HP (Shopify)" },
  { key: "recipient_name", label: "Penerima" },
  { key: "recipient_address", label: "Alamat Penerima" },
  { key: "order_code", label: "Order Code" },
  { key: "service_code", label: "Service" },
  { key: "shipping_cost", label: "Biaya" },
  { key: "weight", label: "Berat" },
  { key: "payment_method", label: "Bayar" },
  { key: "item", label: "Barang" },
  { key: "ship_date", label: "Ship Date" },
];

export default function ReviewPanel({ records }: { records: VerifyRecord[] }) {
  // Editable working copy: page -> field -> value
  const [edits, setEdits] = useState<Record<number, Record<string, string>>>(() => {
    const init: Record<number, Record<string, string>> = {};
    for (const r of records) {
      init[r.page] = {};
      for (const c of COLUMNS) init[r.page][c.key] = r.fields[c.key]?.value ?? "";
    }
    return init;
  });
  const [verified, setVerified] = useState<Record<number, boolean>>({});
  const [zoom, setZoom] = useState<string | null>(null);

  const setVal = (page: number, key: string, v: string) =>
    setEdits((e) => ({ ...e, [page]: { ...e[page], [key]: v } }));

  const toReviewCount = useMemo(
    () => records.filter((r) => r.needsReview && !verified[r.page]).length,
    [records, verified],
  );
  const verifiedCount = useMemo(
    () => records.filter((r) => verified[r.page]).length,
    [records, verified],
  );

  const rows = () =>
    records.map((r) => {
      const o: Record<string, string | number> = {
        page: r.page,
        source: r.matchStatus === "shopify" ? "Shopify" : "Manual/WA",
        order: r.matchedOrder ?? "",
        verified: verified[r.page] ? "yes" : "no",
      };
      for (const c of COLUMNS) o[c.key] = edits[r.page]?.[c.key] ?? "";
      return o;
    });

  const downloadCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cols = ["page", ...COLUMNS.map((c) => c.key), "source", "order", "verified"];
    const header = ["Page", ...COLUMNS.map((c) => c.label), "Source", "Order", "Verified"].map(esc).join(",");
    const body = rows().map((row) => cols.map((k) => esc(row[k])).join(","));
    download(new Blob([[header, ...body].join("\n")], { type: "text/csv" }), "labels-verified.csv");
  };
  const downloadJson = () =>
    download(new Blob([JSON.stringify(rows(), null, 2)], { type: "application/json" }), "labels-verified.json");

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="review-summary">
        <div>
          <strong>{records.length}</strong> pages ·{" "}
          <span className="good">{records.filter((r) => r.fields.tracking_number?.confidence === "certain").length} AWB barcode-confirmed</span> ·{" "}
          <span className="good">{records.filter((r) => r.matchStatus === "shopify").length} Shopify phone</span> ·{" "}
          <span className="warn">{records.filter((r) => r.matchStatus === "manual").length} manual/WA</span> ·{" "}
          {verifiedCount} verified
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button className="ghost" onClick={downloadCsv}>Download CSV</button>
          <button className="ghost" onClick={downloadJson}>Download JSON</button>
        </div>
      </div>

      <p className="note" style={{ marginBottom: 16 }}>
        Tracking numbers marked <span className="badge bc">barcode ✓</span> are decoded exactly from the
        label barcode — no OCR error possible. Cells outlined <span className="warn">in amber</span> failed a
        validation check or lacked a reliable source: eyeball them against the thumbnail, fix if needed, then
        mark the page verified. Export reflects your edits.
      </p>

      <div className="cards">
        {records.map((r) => {
          const isVer = !!verified[r.page];
          return (
            <div key={r.page} className={`review-card${r.needsReview && !isVer ? " flagged" : ""}${isVer ? " verified" : ""}`}>
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.thumbnail} alt={`Page ${r.page}`} onClick={() => setZoom(r.thumbnail)} />
                <div className="thumb-label">Page {r.page}</div>
              </div>
              <div className="fields">
                {COLUMNS.map((c) => {
                  const f = r.fields[c.key];
                  const low = f?.confidence === "low";
                  const certain = f?.confidence === "certain";
                  return (
                    <div className="field-row" key={c.key}>
                      <label>
                        {c.label}
                        {certain && <span className="badge bc">barcode ✓</span>}
                        {f?.flag && <span className="badge warn-badge">{f.flag}</span>}
                      </label>
                      <input
                        className={low ? "low" : certain ? "certain" : ""}
                        value={edits[r.page]?.[c.key] ?? ""}
                        onChange={(e) => setVal(r.page, c.key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="card-actions">
                <div className="match-info">
                  {r.matchStatus === "manual" ? (
                    <span className="status-pill manual">Manual / WA</span>
                  ) : (
                    <>
                      <span className="status-pill shopify">Shopify</span>
                      {r.matchedOrder && <span className="match-order">{r.matchedOrder}</span>}
                    </>
                  )}
                  {r.matchStatus !== "manual" && (
                    <span className="match-reasons">{(r.matchReasons || []).join(" · ")}</span>
                  )}
                </div>
                <label className="verify-toggle">
                  <input type="checkbox" checked={isVer} onChange={(e) => setVerified((v) => ({ ...v, [r.page]: e.target.checked }))} />
                  Verified
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Zoomed page" />
        </div>
      )}
    </div>
  );
}
