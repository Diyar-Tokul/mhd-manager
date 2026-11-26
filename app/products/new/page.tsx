"use client";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/lib/api";
import { ProductInput } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();

  async function save(data: ProductInput) {
    await createProduct(data); // Fehler zeigt das Formular an
    router.push("/products");
  }

  return (
    <AuthGuard>
      <h1>Neues Produkt</h1>
      <ProductForm isNew buttonText="Produkt speichern" onSubmit={save} />
    </AuthGuard>
  );
}
