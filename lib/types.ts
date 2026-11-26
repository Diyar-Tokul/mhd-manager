export type Status = "aktiv" | "reduziert" | "verkauft" | "entsorgt";

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

export const STATUS_LIST: Status[] = ["aktiv", "reduziert", "verkauft", "entsorgt"];
export const CATEGORIES = ["Milchprodukte", "Wurst", "Fleisch", "Backwaren", "Obst & Gemüse", "Getränke", "Konserven", "Süßwaren", "Sonstiges"];
