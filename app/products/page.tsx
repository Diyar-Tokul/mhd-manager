"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { Product, STATUS_LIST } from "@/lib/types";
import { getAmpel, daysText, formatDate } from "@/lib/mhd";

export default function ProductsPage() {
  return <AuthGuard><Products /></AuthGuard>;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("alle");

  useEffect(() => {
    supabase.from("products").select("*").order("expiry_date").then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (status === "alle" || p.status === status)
  );

  return (
    <>
      <h1>Produktübersicht</h1>
      <div className="filters">
        <input placeholder="Produkt suchen..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="alle">Alle Status</option>
          {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Link href="/products/new" className="btn">+ Neues Produkt</Link>
      </div>

      {filtered.length === 0 ? (
        <p className="box">Keine Produkte gefunden.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produkt</th><th>Kategorie</th><th>Menge</th><th>MHD</th><th>Ampel</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p) => {
                const a = getAmpel(p.expiry_date);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.quantity}</td>
                    <td>{formatDate(p.expiry_date)}</td>
                    <td><span className={`ampel ${a.color}`}>{a.label}</span> <small>{daysText(a.days)}</small></td>
                    <td>{p.status}</td>
                    <td><Link href={`/products/${p.id}`}>Bearbeiten</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
