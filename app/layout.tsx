import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MHD-Manager",
  description: "Digitale Überwachung von Mindesthaltbarkeitsdaten",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
