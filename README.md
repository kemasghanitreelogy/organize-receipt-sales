# Resi → Kurir · AWB · No. HP

Upload a shipping-label PDF or photo and get clean data — **Courier · AWB · Phone · Name ·
Address** — ready to export. Built for organizing J&T and Lion Parcel waybills against
Shopify orders, but the OCR works on any scanned label.

**Live:** https://organize-receipt-sales.vercel.app

## How it works

Everything heavy runs **in the browser** — the file never leaves the device:

1. **Render** each page with `pdf.js` (or load the photo) onto a canvas.
2. **Decode the AWB barcode** with `zxing-wasm` (Code-128 / Code-39). The tracking number is
   therefore **exact — no OCR error possible** — and cross-confirmed by the two barcodes on the
   label. Supports J&T (`JD…`) and Lion Parcel (`…LP…`); add more in `app/lib/browserOcr.ts` +
   `app/lib/labelCore.ts`.
3. **Read the label** with `tesseract.js` (ind+eng) and parse the fields (`app/lib/localExtract.ts`).
4. **Cross-check the recipient against Shopify** to pull the phone number. Only the small
   extracted name + postcode + phone-last-4 is POSTed to `/api/match` — a tiny, fast server call
   (the only place the secret Shopify token is used).

Because the PDF/photo is processed client-side, the app runs on a **free serverless tier** with no
upload-size or timeout limits, and the file + thumbnails stay private.

## The matcher — digit-first, never a wrong-but-confident guess

Local OCR reads digits reliably but names noisily, so `app/lib/shopify.ts` matches by the digits
and treats the name as an anchor, all fuzzy-tolerant of one OCR slip:

- **phone last-4** — the label masks the phone as `****1234`; those four digits must equal the
  order phone's last four.
- **postcode** — the label's 5-digit postcode vs the order zip.
- **name token overlap** — robust to trailing OCR garbage.

A match is **certain** only when the name agrees **and** a hard key confirms it — with guards so
that a phone-4 contradiction, or two same-name neighbours, drop to review instead of guessing. A
confident match returns the **clean name/phone/address from Shopify**. Anything else is tagged
**Manual / WA** (e.g. an order placed directly on WhatsApp, not in Shopify) with the phone left
blank for manual entry — never a misleading suggestion.

On the sample batches (J&T + Lion): **13/13 AWB barcode-confirmed, 12/13 phones matched with
certainty, 1 manual** — the machine confirms what it's sure of and flags the rest.

## Review + export

A card per page shows the label thumbnail and every field, inline-editable. `barcode ✓` marks the
exact AWB, `Shopify ✓` marks match-filled contact, amber cells need a glance. Tick **Verified**
and export **CSV / JSON** (with a `Source` = Shopify / Manual-WA column).

## Configuration (env)

```
STORE_NAME=your-store.myshopify.com
ADMIN_API_KEY=shpat_...        # Shopify Admin API token (read_orders scope)
APP_PASSWORD=...               # optional — if set, /api/match requires this password
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```
