// MHD-Ampel: berechnet Tage bis zum MHD und die passende Stufe

export type Ampel = { label: string; color: string; days: number };

export function daysUntil(expiry: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(expiry + "T00:00:00");
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getAmpel(expiry: string): Ampel {
  const days = daysUntil(expiry);
  if (days < 0) return { label: "Abgelaufen", color: "black", days };
  if (days === 0) return { label: "Heute", color: "red", days };
  if (days <= 6) return { label: "Bald fällig", color: "orange", days };
  if (days <= 14) return { label: "Beobachten", color: "yellow", days };
  return { label: "OK", color: "green", days };
}

export function daysText(days: number): string {
  if (days < 0) return `seit ${-days} Tag${days === -1 ? "" : "en"} abgelaufen`;
  if (days === 0) return "läuft heute ab";
  return `noch ${days} Tag${days === 1 ? "" : "e"}`;
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("de-DE");
}
