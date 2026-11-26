// MHD-Ampel: berechnet Tage bis zum MHD, die passende Stufe und einen Rabattvorschlag

export type AmpelColor = "green" | "yellow" | "orange" | "red" | "black";
export type Ampel = { label: string; color: AmpelColor; days: number };

// Alle Ampelstufen in fester Reihenfolge (für Filter und Statistik)
export const AMPEL_STUFEN: { color: AmpelColor; label: string }[] = [
  { color: "black", label: "Abgelaufen" },
  { color: "red", label: "Heute" },
  { color: "orange", label: "Bald fällig" },
  { color: "yellow", label: "Beobachten" },
  { color: "green", label: "OK" },
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// today ist optional, damit die Funktion testbar ist
export function daysUntil(expiry: string, today: Date = new Date()): number {
  const t = startOfDay(today);
  const date = new Date(expiry + "T00:00:00");
  return Math.round((date.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

export function ampelForDays(days: number): Ampel {
  if (days < 0) return { label: "Abgelaufen", color: "black", days };
  if (days === 0) return { label: "Heute", color: "red", days };
  if (days <= 6) return { label: "Bald fällig", color: "orange", days };
  if (days <= 14) return { label: "Beobachten", color: "yellow", days };
  return { label: "OK", color: "green", days };
}

export function getAmpel(expiry: string, today: Date = new Date()): Ampel {
  return ampelForDays(daysUntil(expiry, today));
}

export function daysText(days: number): string {
  if (days < 0) return `seit ${-days} Tag${days === -1 ? "" : "en"} abgelaufen`;
  if (days === 0) return "läuft heute ab";
  return `noch ${days} Tag${days === 1 ? "" : "e"}`;
}

// Rabattvorschlag für Mitarbeiter (nur Empfehlung, wird nicht gespeichert)
export type Vorschlag = { text: string; percent: number | null };

export function discountSuggestion(days: number): Vorschlag | null {
  if (days < 0) return { text: "Aussortieren / prüfen", percent: null };
  if (days === 0) return { text: "50 % reduzieren", percent: 50 };
  if (days <= 2) return { text: "30 % reduzieren", percent: 30 };
  if (days <= 6) return { text: "20 % reduzieren", percent: 20 };
  return null;
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("de-DE");
}

// Datum als YYYY-MM-DD (lokale Zeit), z. B. für Testdaten
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
