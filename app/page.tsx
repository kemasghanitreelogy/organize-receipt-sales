"use client";

import { useCallback, useRef, useState } from "react";
import ReviewPanel, { VerifyRecord } from "./components/ReviewPanel";

type Usage = {
  promptTokenCount: number | null;
  candidatesTokenCount: number | null;
  thoughtsTokenCount: number | null;
  totalTokenCount: number | null;
};

type LabelRow = Record<string, string | number | null>;

type Result = {
  provider: string;
  mode: string;
  model: string;
  text: string;
  structured: LabelRow[] | null;
  records?: VerifyRecord[];
  reviewCount?: number;
  barcodeConfirmed?: number;
  phoneMatched?: number;
  elapsedMs: number;
  confidence: number | null;
  pageCount: number | null;
  usage: Usage | null;
};

const STRUCT_COLUMNS: { key: string; label: string }[] = [
  { key: "page", label: "Pg" },
  { key: "order_code", label: "Order Code" },
  { key: "tracking_number", label: "Tracking No." },
  { key: "service_code", label: "Svc" },
  { key: "recipient_name", label: "Penerima" },
  { key: "recipient_address", label: "Alamat Penerima" },
  { key: "sender_name", label: "Pengirim" },
  { key: "shipping_cost", label: "Biaya" },
  { key: "weight", label: "Berat" },
  { key: "payment_method", label: "Bayar" },
  { key: "item", label: "Barang" },
  { key: "notes", label: "Notes" },
  { key: "ship_date", label: "Ship" },
];

const ACCEPTED = /^(application\/pdf|image\/(png|jpe?g|webp|heic|heif|tiff?))$/i;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((f: File | null) => {
    setError(null);
    setResult(null);
    if (!f) return;
    const looksOk = ACCEPTED.test(f.type) || /\.(pdf|png|jpe?g|webp|heic|heif|tiff?)$/i.test(f.name);
    if (!looksOk) {
      setError("Please choose a PDF or an image file.");
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      pickFile(e.dataTransfer.files?.[0] ?? null);
    },
    [pickFile],
  );

  const submit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Always the world-class local verify pipeline — no engine/output choice.
      fd.append("provider", "local");
      fd.append("mode", "verify");
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const raw = await res.text();
      let data: (Result & { error?: string }) | null = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // Non-JSON response — usually a platform-level error page, not our API.
        if (res.status === 413) throw new Error("File too large for the server. On Vercel the limit is ~4.5MB per request; run locally for big PDFs or split the file.");
        if (res.status === 504 || res.status === 408) throw new Error("Processing timed out on the server. This on-device OCR runs best locally or on a container host, not serverless.");
        throw new Error(`Server error (${res.status}). ${raw.slice(0, 140)}`);
      }
      if (!res.ok) throw new Error(data?.error || "Extraction failed.");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const copyText = useCallback(() => {
    if (result) navigator.clipboard.writeText(result.text);
  }, [result]);

  const download = useCallback(() => {
    if (!result) return;
    const isStruct = result.mode === "struct" && result.structured;
    const blob = isStruct
      ? new Blob([JSON.stringify(result.structured, null, 2)], { type: "application/json" })
      : new Blob([result.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(file?.name || "output").replace(/\.pdf$/i, "")}.${isStruct ? "json" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  const downloadCsv = useCallback(() => {
    if (!result?.structured) return;
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = STRUCT_COLUMNS.map((c) => esc(c.label)).join(",");
    const rows = result.structured.map((r) => STRUCT_COLUMNS.map((c) => esc(r[c.key])).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(file?.name || "labels").replace(/\.pdf$/i, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  const fmt = (n: number | null) => (n == null ? "—" : n.toLocaleString());

  return (
    <div className="wrap">
      <header>
        <h1>Resi → Data Kurir · AWB · No. HP</h1>
        <p>
          Upload a shipping-label PDF or photo. The system decodes the AWB from the barcode,
          reads each label, and cross-checks the recipient against your Shopify orders to pull
          the phone number — 100% on-device, no API key, no cost. Clean data, ready to export.
        </p>
      </header>

      <div className="card">
        <div
          className={`dropzone${drag ? " drag" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <div>
            <strong>Drop a PDF or image here</strong> or click to browse
          </div>
          <div className="hint">PDF or photo (PNG / JPG) of shipping labels · max 20MB</div>
          {file && <div className="file">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,image/tiff"
            style={{ display: "none" }}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="controls" style={{ justifyContent: "flex-end" }}>
          <button className="primary" disabled={!file || loading} onClick={submit}>
            {loading && <span className="spinner" />}
            {loading ? "Processing…" : "Extract & match"}
          </button>
        </div>

        {error && <div className="error">⚠ {error}</div>}
      </div>

      {result && (
        <div className="card">
          <div className="stats">
            {result.mode === "verify" ? (
              <>
                <div className="stat">
                  <div className="k">Pages</div>
                  <div className="v">{fmt(result.pageCount)}</div>
                </div>
                <div className="stat">
                  <div className="k">AWB confirmed</div>
                  <div className="v good">{fmt(result.barcodeConfirmed ?? null)}</div>
                </div>
                <div className="stat">
                  <div className="k">Phone matched</div>
                  <div className="v good">{fmt(result.phoneMatched ?? null)}</div>
                </div>
                <div className="stat">
                  <div className="k">Need review</div>
                  <div className="v" style={{ color: (result.reviewCount ?? 0) > 0 ? "var(--danger)" : "var(--accent)" }}>
                    {fmt(result.reviewCount ?? null)}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">Total tokens</div>
                  <div className="v">{fmt(result.usage?.totalTokenCount ?? null)}</div>
                </div>
              </>
            ) : result.provider === "local" ? (
              <>
                <div className="stat">
                  <div className="k">Engine</div>
                  <div className="v good" style={{ fontSize: 15 }}>Local · free</div>
                </div>
                <div className="stat">
                  <div className="k">Pages</div>
                  <div className="v">{fmt(result.pageCount)}</div>
                </div>
                <div className="stat">
                  <div className="k">Avg confidence</div>
                  <div className="v">{result.confidence == null ? "—" : `${result.confidence}%`}</div>
                </div>
                <div className="stat">
                  <div className="k">Cost</div>
                  <div className="v good">$0.00</div>
                </div>
              </>
            ) : (
              <>
                <div className="stat">
                  <div className="k">Input tokens (PDF)</div>
                  <div className="v">{fmt(result.usage?.promptTokenCount ?? null)}</div>
                </div>
                <div className="stat">
                  <div className="k">Output tokens</div>
                  <div className="v">{fmt(result.usage?.candidatesTokenCount ?? null)}</div>
                </div>
                <div className="stat">
                  <div className="k">Thinking tokens</div>
                  <div className="v good">{fmt(result.usage?.thoughtsTokenCount ?? null)}</div>
                </div>
                <div className="stat">
                  <div className="k">Total tokens</div>
                  <div className="v">{fmt(result.usage?.totalTokenCount ?? null)}</div>
                </div>
              </>
            )}
            <div className="stat">
              <div className="k">Time</div>
              <div className="v">{(result.elapsedMs / 1000).toFixed(1)}s</div>
            </div>
          </div>

          {result.mode !== "verify" && (
            <div className="toolbar">
              {result.mode !== "struct" && (
                <button className="ghost" onClick={copyText}>
                  Copy text
                </button>
              )}
              <button className="ghost" onClick={download}>
                Download {result.mode === "struct" ? "JSON" : "TXT"}
              </button>
              {result.mode === "struct" && result.structured && (
                <button className="ghost" onClick={downloadCsv}>
                  Download CSV
                </button>
              )}
            </div>
          )}

          {result.mode === "verify" && result.records ? (
            <ReviewPanel records={result.records} />
          ) : result.mode === "struct" && result.structured ? (
            <div className="table-scroll">
              <table className="grid">
                <thead>
                  <tr>
                    {STRUCT_COLUMNS.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.structured.map((row, i) => (
                    <tr key={i}>
                      {STRUCT_COLUMNS.map((c) => (
                        <td key={c.key}>{row[c.key] == null ? "" : String(row[c.key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="output">{result.text || "(no text returned)"}</pre>
          )}
        </div>
      )}

      <p className="note">
        How it works: each page is rendered on-device, the AWB is decoded from the barcode
        (exact, no OCR error), the label is read with Tesseract, and the recipient is matched
        against your Shopify orders (name + postcode + phone last-4) to pull the phone number.
        Nothing is sent to any AI service — no API key, no quota, no cost.
      </p>
    </div>
  );
}
