export type Status = "aktiv" | "reduziert" | "verkauft" | "entsorgt";
export type Role = "mitarbeiter" | "admin";

export type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiry_date: string;
  article_number: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
};

// Daten, die beim Anlegen/Bearbeiten gespeichert werden
export type ProductInput = {
  name: string;
  category: string;
  quantity: number;
  expiry_date: string;
  article_number: string | null;
  status: Status;
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export const STATUS_LIST: Status[] = ["aktiv", "reduziert", "verkauft", "entsorgt"];
export const CATEGORIES = ["Milchprodukte", "Wurst", "Fleisch", "Backwaren", "Obst & Gemüse", "Getränke", "Konserven", "Süßwaren", "Sonstiges"];

// Produkte, die noch im Markt stehen
export function isInMarket(p: Product): boolean {
  return p.status === "aktiv" || p.status === "reduziert";
}
