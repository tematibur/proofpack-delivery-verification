import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proofpack — Evidence-backed delivery verification",
  description: "Compare delivery photos with a packing list without false missing-item claims.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
