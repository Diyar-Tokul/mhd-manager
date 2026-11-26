"use client";
import { useState } from "react";
import { CATEGORIES, STATUS_LIST, Status } from "@/lib/types";

export type FormData = {
  name: string;
  category: string;
  quantity: number;
  expiry_date: string;
  article_number: string;
  status: Status;
};

type Props = {
  initial?: FormData;
  buttonText: string;
  showStatus?: boolean;
  onSubmit: (data: FormData) => Promise<void>;
};

const empty: FormData = { name: "", category: CATEGORIES[0], quantity: 1, expiry_date: "", article_number: "", status: "aktiv" };

export default function ProductForm({ initial, buttonText, showStatus, onSubmit }: Props) {
  const [data, setData] = useState<FormData>(initial || empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(field: keyof FormData, value: string | number) {
    setData({ ...data, [field]: value });
  }

  async function submit() {
    // Validierung
    if (data.name.trim() === "") return setError("Bitte einen Produktnamen eingeben.");
    if (data.quantity < 0 || isNaN(data.quantity)) return setError("Die Menge muss 0 oder größer sein.");
    if (data.expiry_date === "") return setError("Bitte ein MHD auswählen.");
    setError("");
    setSaving(true);
    await onSubmit(data);
    setSaving(false);
  }

  return (
    <div className="box">
      <label>Produktname *</label>
      <input value={data.name} onChange={(e) => change("name", e.target.value)} placeholder="z. B. Milch 1,5 %" />

      <label>Kategorie *</label>
      <select value={data.category} onChange={(e) => change("category", e.target.value)}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>

      <label>Menge *</label>
      <input type="number" min={0} value={data.quantity} onChange={(e) => change("quantity", parseInt(e.target.value))} />

      <label>MHD *</label>
      <input type="date" value={data.expiry_date} onChange={(e) => change("expiry_date", e.target.value)} />

      <label>Artikelnummer (optional)</label>
      <input value={data.article_number} onChange={(e) => change("article_number", e.target.value)} />

      {showStatus && (
        <>
          <label>Status</label>
          <select value={data.status} onChange={(e) => change("status", e.target.value)}>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      {error && <p className="error">{error}</p>}
      <div className="row">
        <button onClick={submit} disabled={saving}>{saving ? "Speichern..." : buttonText}</button>
      </div>
    </div>
  );
}
