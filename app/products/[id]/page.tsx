"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ProductForm, { FormData } from "@/components/ProductForm";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { getAmpel, daysText } from "@/lib/mhd";

export default function EditProductPage() {
  return <AuthGuard><EditProduct /></AuthGuard>;
}

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => setProduct(data));
  }, [id]);

  async function save(data: FormData) {
    const { error } = await supabase.from("products")
      .update({ ...data, article_number: data.article_number || null })
      .eq("id", id);
    if (error) alert("Fehler beim Speichern: " + error.message);
    else router.push("/products");
  }

  async function setStatus(status: string) {
    await supabase.from("products").update({ status }).eq("id", id);
    router.push("/products");
  }

  async function remove() {
    if (!confirm("Produkt wirklich löschen?")) return;
    const { error, count } = await supabase.from("products").delete({ count: "exact" }).eq("id", id);
    if (error || count === 0) alert("Löschen nicht möglich. Nur Administratoren dürfen Produkte löschen.");
    else router.push("/products");
  }

  if (!product) return <p>Lade...</p>;
  const a = getAmpel(product.expiry_date);

  return (
    <>
      <h1>{product.name} bearbeiten</h1>
      <p><span className={`ampel ${a.color}`}>{a.label}</span> {daysText(a.days)}</p>

      <div className="box">
        <strong>Schnellaktionen</strong>
        <div className="row">
          <button onClick={() => setStatus("reduziert")}>Als reduziert markieren</button>
          <button className="grey" onClick={() => setStatus("verkauft")}>Verkauft</button>
          <button className="grey" onClick={() => setStatus("entsorgt")}>Entsorgt</button>
          <button className="danger" onClick={remove}>Löschen</button>
        </div>
      </div>

      <ProductForm
        showStatus
        buttonText="Änderungen speichern"
        onSubmit={save}
        initial={{
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          expiry_date: product.expiry_date,
          article_number: product.article_number || "",
          status: product.status,
        }}
      />
    </>
  );
}
