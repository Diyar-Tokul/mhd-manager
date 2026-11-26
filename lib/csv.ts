// CSV-Export der Produktliste (öffnet sich in Excel mit Semikolon als Trennzeichen)
import { Product } from "./types";
import { formatDate, getAmpel } from "./mhd";

function cell(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function productsToCsv(products: Product[]): string {
  const header = ["Produkt", "Kategorie", "Menge", "MHD", "Ampel", "Status", "Artikelnummer"];
  const rows = products.map((p) => [
    p.name, p.category, p.quantity, formatDate(p.expiry_date), getAmpel(p.expiry_date).label, p.status, p.article_number,
  ]);
  return [header, ...rows].map((r) => r.map(cell).join(";")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM, damit Umlaute in Excel korrekt angezeigt werden
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
