import { describe, expect, it } from "vitest";
import { ampelForDays, daysText, daysUntil, discountSuggestion, getAmpel, isoDate } from "../lib/mhd";
import { validateProduct, ProductValues } from "../lib/validation";
import { productsToCsv } from "../lib/csv";
import { Product } from "../lib/types";

const TODAY = new Date(2026, 10, 26, 15, 30); // 26.11.2026, nachmittags

function plus(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

describe("daysUntil", () => {
  it("rechnet Tage unabhängig von der Uhrzeit", () => {
    expect(daysUntil("2026-11-26", TODAY)).toBe(0);
    expect(daysUntil("2026-11-27", TODAY)).toBe(1);
    expect(daysUntil("2026-11-25", TODAY)).toBe(-1);
  });
  it("funktioniert über Monats- und Jahresgrenzen", () => {
    expect(daysUntil("2026-12-01", TODAY)).toBe(5);
    expect(daysUntil("2027-01-01", TODAY)).toBe(36);
  });
  it("funktioniert über die Zeitumstellung", () => {
    expect(daysUntil("2027-03-29", new Date(2027, 2, 27))).toBe(2);
  });
});

describe("MHD-Ampel (Grenzwerte)", () => {
  it.each([
    [-1, "black", "Abgelaufen"],
    [0, "red", "Heute"],
    [1, "orange", "Bald fällig"],
    [6, "orange", "Bald fällig"],
    [7, "yellow", "Beobachten"],
    [14, "yellow", "Beobachten"],
    [15, "green", "OK"],
  ])("%i Tage → %s", (days, color, label) => {
    const a = ampelForDays(days);
    expect(a.color).toBe(color);
    expect(a.label).toBe(label);
  });
  it("getAmpel nutzt das Datum", () => {
    expect(getAmpel(plus(3), TODAY).color).toBe("orange");
  });
});

describe("daysText", () => {
  it("Einzahl und Mehrzahl", () => {
    expect(daysText(1)).toBe("noch 1 Tag");
    expect(daysText(5)).toBe("noch 5 Tage");
    expect(daysText(0)).toBe("läuft heute ab");
    expect(daysText(-1)).toBe("seit 1 Tag abgelaufen");
    expect(daysText(-4)).toBe("seit 4 Tagen abgelaufen");
  });
});

describe("Rabattvorschlag", () => {
  it("staffelt nach Resttagen", () => {
    expect(discountSuggestion(-2)?.percent).toBeNull();
    expect(discountSuggestion(0)?.percent).toBe(50);
    expect(discountSuggestion(2)?.percent).toBe(30);
    expect(discountSuggestion(6)?.percent).toBe(20);
    expect(discountSuggestion(7)).toBeNull();
  });
});

describe("Validierung", () => {
  const ok: ProductValues = { name: "Milch", category: "Milchprodukte", quantity: "3", expiry_date: plus(5), article_number: "", status: "aktiv" };

  it("akzeptiert gültige Eingaben", () => {
    expect(validateProduct(ok, true, TODAY)).toBeNull();
  });
  it("erkennt fehlende Pflichtfelder", () => {
    expect(validateProduct({ ...ok, name: "  " }, true, TODAY)).toMatch(/Produktnamen/);
    expect(validateProduct({ ...ok, expiry_date: "" }, true, TODAY)).toMatch(/MHD/);
  });
  it("erkennt ungültige Mengen", () => {
    expect(validateProduct({ ...ok, quantity: "" }, true, TODAY)).toMatch(/Menge/);
    expect(validateProduct({ ...ok, quantity: "-1" }, true, TODAY)).toMatch(/Menge/);
    expect(validateProduct({ ...ok, quantity: "1.5" }, true, TODAY)).toMatch(/Menge/);
    expect(validateProduct({ ...ok, quantity: "0" }, true, TODAY)).toBeNull();
  });
  it("verbietet MHD in der Vergangenheit nur beim Anlegen", () => {
    expect(validateProduct({ ...ok, expiry_date: plus(-1) }, true, TODAY)).toMatch(/Vergangenheit/);
    expect(validateProduct({ ...ok, expiry_date: plus(-1) }, false, TODAY)).toBeNull();
  });
  it("prüft EAN-8 und EAN-13", () => {
    expect(validateProduct({ ...ok, article_number: "12345678" }, true, TODAY)).toBeNull();
    expect(validateProduct({ ...ok, article_number: "4001234500011" }, true, TODAY)).toBeNull();
    expect(validateProduct({ ...ok, article_number: "123" }, true, TODAY)).toMatch(/EAN/);
    expect(validateProduct({ ...ok, article_number: "40012345abc11" }, true, TODAY)).toMatch(/EAN/);
  });
});

describe("CSV-Export", () => {
  it("setzt Semikolons und maskiert Sonderzeichen", () => {
    const p: Product = {
      id: "1", name: 'Milch "Bio"; 1,5 %', category: "Milchprodukte", quantity: 2, expiry_date: "2026-12-01",
      article_number: null, status: "aktiv", created_at: "", updated_at: "",
    };
    const lines = productsToCsv([p]).split("\n");
    expect(lines[0]).toBe("Produkt;Kategorie;Menge;MHD;Ampel;Status;Artikelnummer");
    expect(lines[1].startsWith('"Milch ""Bio""; 1,5 %";Milchprodukte;2;')).toBe(true);
  });
});
