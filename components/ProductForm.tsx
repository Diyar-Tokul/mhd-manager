"use client";
import { useState } from "react";
import { CATEGORIES, STATUS_LIST, ProductInput } from "@/lib/types";
import { getAmpel, daysText } from "@/lib/mhd";
import { ProductValues, validateProduct } from "@/lib/validation";

type Values = ProductValues;

type Props = {
  initial?: ProductInput;
  buttonText: string;
  isNew?: boolean;
  onSubmit: (data: ProductInput) => Promise<void>;
};

const empty: Values = { name: "", category: CATEGORIES[0], quantity: "1", expiry_date: "", article_number: "", status: "aktiv" };

function toValues(p: ProductInput): Values {
  return { ...p, quantity: String(p.quantity), article_number: p.article_number || "" };
}

export default function ProductForm({ initial, buttonText, isNew = false, onSubmit }: Props) {
  const [v, setV] = useState<Values>(initial ? toValues(initial) : empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(field: keyof Values, value: string) {
    setV({ ...v, [field]: value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validateProduct(v, isNew);
    if (msg) return setError(msg);
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name: v.name.trim(),
        category: v.category,
        quantity: parseInt(v.quantity, 10),
        expiry_date: v.expiry_date,
        article_number: v.article_number.trim() || null,
        status: v.status,
      });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const preview = v.expiry_date ? getAmpel(v.expiry_date) : null;

  return (
    <form className="box" onSubmit={submit} noValidate>
      <label htmlFor="name">Produktname *</label>
      <input id="name" value={v.name} onChange={(e) => change("name", e.target.value)} placeholder="z. B. Milch 1,5 %" />

      <div className="grid2">
        <div>
          <label htmlFor="category">Kategorie *</label>
          <select id="category" value={v.category} onChange={(e) => change("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="quantity">Menge *</label>
          <input id="quantity" type="number" min={0} value={v.quantity} onChange={(e) => change("quantity", e.target.value)} />
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="expiry">MHD *</label>
          <input id="expiry" type="date" value={v.expiry_date} onChange={(e) => change("expiry_date", e.target.value)} />
          {preview && <p className="hint"><span className={`ampel ${preview.color}`}>{preview.label}</span> {daysText(preview.days)}</p>}
        </div>
        <div>
          <label htmlFor="ean">Artikelnummer / EAN (optional)</label>
          <input id="ean" inputMode="numeric" value={v.article_number} onChange={(e) => change("article_number", e.target.value)} placeholder="8 oder 13 Ziffern" />
        </div>
      </div>

      {!isNew && (
        <>
          <label htmlFor="status">Status</label>
          <select id="status" value={v.status} onChange={(e) => change("status", e.target.value)}>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit" disabled={saving}>{saving ? "Speichern..." : buttonText}</button>
      </div>
    </form>
  );
}
