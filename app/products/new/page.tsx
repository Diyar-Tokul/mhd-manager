"use client";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ProductForm, { FormData } from "@/components/ProductForm";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const router = useRouter();

  async function save(data: FormData) {
    const { error } = await supabase.from("products").insert({
      ...data,
      article_number: data.article_number || null,
    });
    if (error) alert("Fehler beim Speichern: " + error.message);
    else router.push("/products");
  }

  return (
    <AuthGuard>
      <h1>Neues Produkt</h1>
      <ProductForm buttonText="Produkt speichern" onSubmit={save} />
    </AuthGuard>
  );
}
