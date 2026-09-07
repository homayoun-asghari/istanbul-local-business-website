import type { Metadata } from "next";
import { bodyFont, displayFont } from "@/components/site/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitrin",
  // Every page here is either an internal tool or an unsold demo carrying a real
  // business's name. None of it may be indexed — a demo outranking a salon for its
  // own name is a problem that ends in an awkward phone call.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
