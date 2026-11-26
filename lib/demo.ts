// Demo-Daten im Browser (localStorage) – damit die App ohne Supabase vorgeführt und getestet werden kann
import { AppUser, Product, ProductInput, Role } from "./types";
import { isoDate } from "./mhd";

const PRODUCTS_KEY = "mhd-demo-products";
const USER_KEY = "mhd-demo-user";

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function seed(): Product[] {
  const now = new Date().toISOString();
  const rows: [string, string, number, number, string | null, Product["status"]][] = [
    ["Milch 1,5 %", "Milchprodukte", 15, 6, "4001234500011", "aktiv"],
    ["Joghurt Natur", "Milchprodukte", 20, 2, "4001234500028", "aktiv"],
    ["Túró Rudi", "Milchprodukte", 30, 10, "5998200400017", "aktiv"],
    ["Pick Salami", "Wurst", 8, 40, "5998817311015", "aktiv"],
    ["Kolbász", "Wurst", 5, 0, null, "aktiv"],
    ["Toastbrot", "Backwaren", 12, -1, null, "reduziert"],
    ["Paprika rot", "Obst & Gemüse", 25, 4, null, "aktiv"],
    ["Hähnchenbrust", "Fleisch", 6, 1, null, "aktiv"],
    ["Pöttyös Kakao", "Getränke", 18, 13, null, "aktiv"],
    ["Kukorica Konserve", "Konserven", 40, 300, null, "aktiv"],
    ["Balaton Schokolade", "Süßwaren", 22, 90, null, "aktiv"],
    ["Kefir", "Milchprodukte", 10, -3, null, "entsorgt"],
  ];
  return rows.map(([name, category, quantity, days, article_number, status], i) => ({
    id: `demo-${i + 1}`,
    name, category, quantity, article_number, status,
    expiry_date: inDays(days),
    created_at: now,
    updated_at: now,
  }));
}

function read(): Product[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    const data = seed();
    write(data);
    return data;
  }
  return JSON.parse(raw) as Product[];
}

function write(data: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
}

export const demo = {
  getUser(): AppUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  },
  signIn(role: Role) {
    const user: AppUser = {
      id: `demo-${role}`,
      email: role === "admin" ? "admin@demo.de" : "mitarbeiter@demo.de",
      name: role === "admin" ? "Demo-Admin" : "Demo-Mitarbeiter",
      role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  signOut() {
    localStorage.removeItem(USER_KEY);
  },
  list(): Product[] {
    return read();
  },
  get(id: string): Product | null {
    return read().find((p) => p.id === id) || null;
  },
  create(input: ProductInput): Product {
    const now = new Date().toISOString();
    const product: Product = { ...input, id: `demo-${Date.now()}`, created_at: now, updated_at: now };
    write([...read(), product]);
    return product;
  },
  update(id: string, patch: Partial<ProductInput>) {
    write(read().map((p) => (p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p)));
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id));
  },
  reset() {
    write(seed());
  },
};
