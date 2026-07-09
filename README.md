---
title: Resi Data Extractor
emoji: 📦
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# PDF → Text OCR

Next.js app to upload an **image-based / scanned PDF** (text is inside images, so it
can't be copied directly) and extract it. Built for organizing shipping labels /
receipts (resi), but works for any scanned PDF.

Two OCR engines, switchable in the UI. **The default `Local` engine needs no Gemini API
key at all** — the flagship Verify pipeline (AWB barcode + Shopify phone match) runs 100%
locally.

| Engine | Runs | Cost / quota | Notes |
| --- | --- | --- | --- |
| **Local (default)** | On your machine (Node) | **Free, no key, no quota** | `pdfjs-dist` + `@napi-rs/canvas` + `tesseract.js` + `zxing-wasm`. Does Verify + Text. ~5s/page |
| **Gemini** (optional) | Google cloud | API key + quota | Higher raw-OCR accuracy; also does structured JSON. Not required. |

All engines are npm packages — nothing is installed globally, no Python, no GPU.

## ⭐ Verify mode — the world-class, accuracy-first pipeline

No single OCR model — Gemini, Chandra, or Tesseract — is 100% accurate on low-res
scans. Claiming "100% from one model" is false. Real ~100% accuracy comes from an
**ensemble that knows when it's unsure**, then verifying only the uncertain parts.

Verify mode (Gemini engine → Output → "Verify & extract") does exactly that, per page:

Supports multiple courier templates — **J&T Express** (`JD…` AWB) and **Lion Parcel**
(`…LP…` AWB) — auto-detected from the barcode and logo. Add more couriers by extending the
AWB pattern in `app/lib/verify.ts` and the courier map in `app/lib/localExtract.ts`.

1. **Barcode / QR ground-truth.** The label's Code-128 + Code-39 barcodes are decoded
   with `zxing-wasm` and cross-confirmed against each other. The tracking number is
   therefore **exact — no OCR error is possible** — at **zero extra token cost**.
2. **Gemini structured extraction** fills the remaining fields (names, address, cost…).
3. **Reconciliation:** the barcode value wins for the tracking number; if Gemini
   disagrees, the cell is flagged.
4. **Validation rules** per field — 5-digit postcode, IDR-formatted cost, `X.XX KG`
   weight, plausible name, non-empty essentials — flag anything that fails.
5. **Confidence-gated review UI:** a card per page with the page thumbnail; every field
   is inline-editable; `barcode ✓` marks certain fields; failed/uncertain cells are
   outlined amber. You eyeball only the flagged cells against the image, fix if needed,
   and tick **Verified**. Export (CSV/JSON) reflects your edits.

On the 13-page sample: **13/13 tracking numbers barcode-confirmed (certain), only 1 page
flagged for a human glance**, ~20s, 6,760 tokens (same as plain extraction — barcodes are
free). That is how you honestly reach ~100%: the machine gets ~95%+ right and *tells you*
which cells to confirm, instead of asking you to trust it blindly.

## Shopify cross-check → recipient phone number

Verify mode also matches each label to a **Shopify order** (store configured via
`.env`: `STORE_NAME`, `ADMIN_API_KEY`) to pull the recipient's phone number, so the final
clean dataset is **Courier · AWB · Phone · Name · Address**.

The labels don't carry the tracking number back into Shopify's fulfillments, so matching
can't use the AWB. And with local OCR the recipient **name** is noisy (the masked-phone
region smears into it), while **digits read cleanly**. So the matcher (`app/lib/shopify.ts`)
is deliberately digit-first and fuzzy:

1. **Pool fetch** — pull all orders in a window around the label's ship date (one
   paginated query), instead of searching by the noisy name.
2. **Score by three independent signals**, each fuzzy-tolerant of a single OCR slip:
   - **phone last-4** — the label masks the phone as `****1234`; those four digits vs the
     order phone's last four (Levenshtein ≤1). Near-unique.
   - **postcode** — 5-digit label postcode vs order zip (≤1 edit).
   - **name token overlap** — shared name tokens, robust to trailing OCR garbage.
3. **Identity guard** — a match is `certain` only when the **name agrees AND** a hard key
   (phone-4 or postcode) confirms it, *or* the digit evidence is exceptional (exact
   phone-4 **and** exact postcode). Postcode + fuzzy-phone alone is **not** enough — that
   would let a different person in the same area pass when the true order is outside the
   window. For a certain match, the clean name/phone/address come back **from Shopify**,
   so OCR noise never reaches the output.

Result on the sample, **fully local, no Gemini**: **13/13 AWB barcode-confirmed, 12/13
phones matched with certainty, 1 flagged** (a recipient whose real order predates the
window — correctly sent to review rather than mismatched). Scopes: `read_orders`.

Phone numbers are personal data — the matcher runs server-side and numbers only appear in
your own review screen and exports.

## Configuration (.env)

```
GEMINI_API_KEY=...          # Google AI Studio key (Gemini engine + Verify mode)
STORE_NAME=xxx.myshopify.com
ADMIN_API_KEY=shpat_...     # Shopify Admin API access token (read_orders, read_customers)
```

## Run

```bash
npm install
# .env must contain: GEMINI_API_KEY=...
npm run dev      # http://localhost:3000
```

Open the app, drop a PDF, pick an output mode, click **Extract text**.

## Modes

- **Full text (verbatim OCR)** — plain-text transcription of every page, page-delimited.
- **Structured data (shipping labels)** — one JSON/CSV row per page (tracking number,
  recipient + address, sender, cost, weight, payment, item, notes, date). Uses a strict
  `responseSchema` so the model can't drift off-format.

## How tokens are minimized (and how it's proven)

The UI shows the exact token counts Gemini reports for every run. On the 13-page sample:

| Metric | Text mode | Struct mode |
| --- | --- | --- |
| Input tokens | 3,490 | 3,419 |
| Output tokens | 8,496 | 3,342 |
| **Thinking tokens** | **0** | **0** |
| Total | 11,986 | 6,761 |

Three deliberate optimizations, in order of impact:

1. **Native PDF input.** The raw PDF bytes are sent to Gemini, which bills a **flat
   ~258 tokens/page** regardless of resolution (pages are internally rasterized up to
   3072px). `3490 ≈ 13 × 258 + a small prompt` — exactly as predicted. Rasterizing each
   page to a hi-res PNG ourselves would tile a letter page into ~6 × 258 ≈ 1,548 tokens/page
   — roughly **6× more expensive** for no accuracy gain.
2. **`thinkingConfig.thinkingBudget: 0`.** OCR is perception, not reasoning, so the
   "thinking" phase is pure waste here. Disabling it holds thinking tokens at **0**
   (verified above) and cuts latency.
3. **Minimal prompt + `text/plain` output** (`temperature: 0`). No markdown fences, no
   commentary — every output token is real transcribed content.

## Accuracy / cost knobs

- **Model selector:** `gemini-2.5-flash` (default, balanced) · `gemini-2.5-flash-lite`
  (cheapest) · `gemini-2.5-pro` (max accuracy for hard scans).
- Everything runs server-side (`app/api/extract/route.ts`); the API key never reaches the
  browser.

## Limits

- Inline upload cap: **20 MB** per PDF (Gemini's inline request limit). For larger files,
  switch to the Gemini File API.
- Gemini supports up to 1,000 pages / 50 MB via the File API.
