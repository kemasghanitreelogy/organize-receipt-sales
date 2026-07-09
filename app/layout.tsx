import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resi → Kurir · AWB · No. HP",
  description: "On-device shipping-label OCR with barcode AWB and Shopify phone matching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject
          attributes like cz-shortcut-listen onto <body> before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
