"use client";

import { useCallback, useRef, useState } from "react";
import ReviewPanel, { VerifyRecord } from "./components/ReviewPanel";
import { extractFromFile, type Progress } from "./lib/browserOcr";
import { reconcile } from "./lib/labelCore";

type Result = {
  records: VerifyRecord[];
  reviewCount: number;
  barcodeConfirmed: number;
  phoneMatched: number;
  pageCount: number;
  elapsedMs: number;
};

type MatchResult = {
  phone: string | null;
  name: string | null;
  address: string | null;
  orderName: string | null;
  confidence: "certain" | "high" | "low";
  reasons: string[];
  flag: string | null;
};

// Labels print ship date as DD-MM-YYYY; normalize to ISO, rejecting implausible
// OCR years so the Shopify window falls back to recent orders instead.
function normalizeShipDate(raw: string | null | undefined): string {
  if (raw) {
    const m = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (m) {
      const dd = +m[1], mm = +m[2];
      const yr = m[3].length === 2 ? 2000 + +m[3] : +m[3];
      if (yr >= 2023 && yr <= 2028 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31)
        return `${yr}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
  }
  return "";
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((f: File | null) => {
    setError(null);
    setResult(null);
    if (!f) return;
    const looksOk = /\.(pdf|png|jpe?g|webp)$/i.test(f.name) || /^(application\/pdf|image\/)/i.test(f.type);
    if (!looksOk) {
      setError("Please choose a PDF or an image (PNG/JPG) file.");
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
    setProgress(null);
    const started = Date.now();
    try {
      // 1) OCR entirely in the browser — the file never leaves this device.
      const { visuals, rows } = await extractFromFile(file, setProgress);
      const records = reconcile(rows, visuals) as VerifyRecord[];

      // 2) Cross-check recipients against Shopify (tiny, fast server call).
      setProgress({ stage: "Matching Shopify orders" });
      const shipDate = normalizeShipDate(rows.find((r) => r.ship_date)?.ship_date);
      const inputs = records.map((r) => ({
        page: r.page,
        name: r.fields.recipient_name?.value || "",
        zip: (r.fields.recipient_address?.value || "").match(/\b\d{5}\b/)?.[0] || "",
        phoneLast4: r.phoneLast4 || "",
        shipDate,
      }));
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      const raw = await res.text();
      let data: { matches?: Record<number, MatchResult>; error?: string };
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Shopify lookup failed (${res.status}).`);
      }
      if (!res.ok) throw new Error(data.error || "Shopify lookup failed.");
      const matches = data.matches || {};

      // 3) Merge matches — trust Shopify's clean contact only when certain.
      for (const r of records) {
        const m = matches[r.page];
        if (m && m.confidence === "certain") {
          r.fields.phone = { value: m.phone, source: "shopify", confidence: "certain", flag: null };
          r.matchedOrder = m.orderName;
          r.matchReasons = m.reasons;
          r.matchStatus = "shopify";
          if (m.name) r.fields.recipient_name = { value: m.name, source: "shopify", confidence: "certain", flag: null };
          if (m.address) r.fields.recipient_address = { value: m.address, source: "shopify", confidence: "certain", flag: null };
        } else {
          r.fields.phone = {
            value: null,
            source: "none",
            confidence: "low",
            flag: "Not in Shopify — likely a direct/WhatsApp order. Enter phone manually.",
          };
          r.matchedOrder = null;
          r.matchReasons = [];
          r.matchStatus = "manual";
        }
        r.needsReview = Object.values(r.fields).some((f) => f.confidence === "low");
      }

      setResult({
        records,
        pageCount: records.length,
        barcodeConfirmed: records.filter((r) => r.fields.tracking_number?.confidence === "certain").length,
        phoneMatched: records.filter((r) => r.matchStatus === "shopify").length,
        reviewCount: records.filter((r) => r.needsReview).length,
        elapsedMs: Date.now() - started,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [file]);

  const fmt = (n: number | null) => (n == null ? "—" : n.toLocaleString());
  const btnLabel = loading
    ? progress?.page && progress?.total
      ? `${progress.stage} ${progress.page}/${progress.total}…`
      : `${progress?.stage ?? "Processing"}…`
    : "Extract & match";

  return (
    <div className="wrap">
      <header>
        <h1>Resi → Data Kurir · AWB · No. HP</h1>
        <p>
          Upload a shipping-label PDF or photo. Everything is read on your device — the barcode
          AWB, the label text, and the recipient — then only the name/postcode is checked against
          your Shopify orders to pull the phone number. The file never leaves your browser.
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
          <div className="hint">PDF or photo (PNG / JPG) of shipping labels</div>
          {file && <div className="file">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="controls" style={{ justifyContent: "flex-end" }}>
          <button className="primary" disabled={!file || loading} onClick={submit}>
            {loading && <span className="spinner" />}
            {btnLabel}
          </button>
        </div>

        {error && <div className="error">⚠ {error}</div>}
      </div>

      {result && (
        <div className="card">
          <div className="stats">
            <div className="stat">
              <div className="k">Pages</div>
              <div className="v">{fmt(result.pageCount)}</div>
            </div>
            <div className="stat">
              <div className="k">AWB confirmed</div>
              <div className="v good">{fmt(result.barcodeConfirmed)}</div>
            </div>
            <div className="stat">
              <div className="k">Phone matched</div>
              <div className="v good">{fmt(result.phoneMatched)}</div>
            </div>
            <div className="stat">
              <div className="k">Need review</div>
              <div className="v" style={{ color: result.reviewCount > 0 ? "var(--danger)" : "var(--accent)" }}>
                {fmt(result.reviewCount)}
              </div>
            </div>
            <div className="stat">
              <div className="k">Time</div>
              <div className="v">{(result.elapsedMs / 1000).toFixed(1)}s</div>
            </div>
          </div>

          <ReviewPanel records={result.records} />
        </div>
      )}

      <p className="note">
        On-device OCR: pages are rendered and read in your browser (pdf.js + Tesseract + barcode
        decoding). Only the extracted name and postcode are sent to the server to look up the phone
        number in Shopify — the PDF, photo, and thumbnails stay on your machine.
      </p>
    </div>
  );
}
