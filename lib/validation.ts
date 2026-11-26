// Prüfung der Formulareingaben für Produkte
import { Status } from "./types";
import { daysUntil } from "./mhd";

// Formularwerte als Text, damit leere Eingaben sauber geprüft werden können
export type ProductValues = {
  name: string;
  category: string;
  quantity: string;
  expiry_date: string;
  article_number: string;
  status: Status;
};

// Gibt eine Fehlermeldung oder null (= alles in Ordnung) zurück
export function validateProduct(v: ProductValues, isNew: boolean, today: Date = new Date()): string | null {
  if (v.name.trim() === "") return "Bitte einen Produktnamen eingeben.";
  if (v.name.trim().length > 100) return "Der Produktname darf höchstens 100 Zeichen lang sein.";
  if (!/^\d+$/.test(v.quantity.trim())) return "Die Menge muss eine ganze Zahl (0 oder größer) sein.";
  if (v.expiry_date === "") return "Bitte ein MHD auswählen.";
  if (isNew && daysUntil(v.expiry_date, today) < 0) return "Das MHD liegt in der Vergangenheit. Bitte Datum prüfen.";
  if (v.article_number.trim() !== "" && !/^(\d{8}|\d{13})$/.test(v.article_number.trim()))
    return "Die Artikelnummer (EAN) muss 8 oder 13 Ziffern haben.";
  return null;
}
