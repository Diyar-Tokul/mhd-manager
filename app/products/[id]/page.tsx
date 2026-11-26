"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import ProductForm from "@/components/ProductForm";
import AmpelBadge from "@/components/AmpelBadge";
import StatusBadge from "@/components/StatusBadge";
import { deleteProduct, getProduct, updateProduct } from "@/lib/api";
import { Product, ProductInput, Status } from "@/lib/types";
import { daysUntil, discountSuggestion } from "@/lib/mhd";

export default function EditProductPage() {
  return <AuthGuard><EditProduct /></AuthGuard>;
}

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id).then(setProduct).catch((e: Error) => setError(e.message));
  }, [id]);

  async function save(data: ProductInput) {
    await updateProduct(id, data); // Fehler zeigt das Formular an
    router.push("/products");
  }

  async function setStatus(status: Status) {
    try {
      await updateProduct(id, { status });
      router.push("/products");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove() {
    if (!product || !confirm(`„${product.name}“ wirklich löschen?`)) return;
    try {
      await deleteProduct(id, user);
      router.push("/products");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (product === undefined && !error) return <p>Lade...</p>;
  if (product === null) return <p className="box">Produkt nicht gefunden. <Link href="/products">Zur Übersicht</Link></p>;
  if (!product) return <p className="error box">{error}</p>;

  const v = discountSuggestion(daysUntil(product.expiry_date));

  return (
    <>
      <p><Link href="/products">← Zurück zur Übersicht</Link></p>
      <h1>{product.name} bearbeiten</h1>
      <p>
        <AmpelBadge expiry={product.expiry_date} /> · Status: <StatusBadge status={product.status} />
        {v && <> · Vorschlag: <strong>{v.text}</strong></>}
      </p>

      <div className="box">
        <strong>Schnellaktionen</strong>
        <div className="row">
          <button onClick={() => setStatus("reduziert")} disabled={product.status === "reduziert"}>Als reduziert markieren</button>
          <button className="grey" onClick={() => setStatus("verkauft")}>Verkauft</button>
          <button className="grey" onClick={() => setStatus("entsorgt")}>Entsorgt</button>
          {user.role === "admin" && <button className="danger" onClick={remove}>Löschen</button>}
        </div>
        {user.role !== "admin" && <p className="hint">Löschen ist nur für Administratoren möglich.</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <ProductForm
        buttonText="Änderungen speichern"
        onSubmit={save}
        initial={{
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          expiry_date: product.expiry_date,
          article_number: product.article_number,
          status: product.status,
        }}
      />
      <p className="hint">Zuletzt geändert: {new Date(product.updated_at).toLocaleString("de-DE")}</p>
    </>
  );
}
