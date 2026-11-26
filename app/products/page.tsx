"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AmpelBadge from "@/components/AmpelBadge";
import StatusBadge from "@/components/StatusBadge";
import { listProducts } from "@/lib/api";
import { CATEGORIES, Product, STATUS_LIST, isInMarket } from "@/lib/types";
import { AMPEL_STUFEN, formatDate, getAmpel, isoDate } from "@/lib/mhd";
import { downloadCsv, productsToCsv } from "@/lib/csv";

type Sort = "mhd" | "name" | "menge";

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<p>Lade...</p>}><Products /></Suspense>
    </AuthGuard>
  );
}

function Products() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "markt");
  const [category, setCategory] = useState("alle");
  const [ampel, setAmpel] = useState(params.get("ampel") || "alle");
  const [sort, setSort] = useState<Sort>("mhd");

  useEffect(() => {
    listProducts().then(setProducts).catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => q === "" || p.name.toLowerCase().includes(q) || (p.article_number || "").includes(q))
      .filter((p) => status === "alle" || (status === "markt" ? isInMarket(p) : p.status === status))
      .filter((p) => category === "alle" || p.category === category)
      .filter((p) => ampel === "alle" || getAmpel(p.expiry_date).color === ampel)
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name, "de");
        if (sort === "menge") return b.quantity - a.quantity;
        return a.expiry_date.localeCompare(b.expiry_date);
      });
  }, [products, search, status, category, ampel, sort]);

  function resetFilters() {
    setSearch(""); setStatus("markt"); setCategory("alle"); setAmpel("alle"); setSort("mhd");
  }

  function exportCsv() {
    downloadCsv(`mhd-produkte-${isoDate(new Date())}.csv`, productsToCsv(filtered));
  }

  if (error) return <p className="error box">{error}</p>;
  if (!products) return <p>Lade...</p>;

  return (
    <>
      <h1>Produktübersicht</h1>
      <div className="filters">
        <input placeholder="Name oder EAN suchen..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="markt">Im Markt</option>
          <option value="alle">Alle Status</option>
          {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategorie">
          <option value="alle">Alle Kategorien</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={ampel} onChange={(e) => setAmpel(e.target.value)} aria-label="Ampel">
          <option value="alle">Alle Ampelstufen</option>
          {AMPEL_STUFEN.map((a) => <option key={a.color} value={a.color}>{a.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sortierung">
          <option value="mhd">Sortieren: MHD</option>
          <option value="name">Sortieren: Name</option>
          <option value="menge">Sortieren: Menge</option>
        </select>
      </div>
      <div className="toolbar">
        <span>{filtered.length} von {products.length} Produkten</span>
        <button className="link" onClick={resetFilters}>Filter zurücksetzen</button>
        <span className="spacer" />
        <button className="grey" onClick={exportCsv} disabled={filtered.length === 0}>CSV exportieren</button>
        <Link href="/products/new" className="btn">+ Neues Produkt</Link>
      </div>

      {filtered.length === 0 ? (
        <p className="box">Keine Produkte gefunden.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produkt</th><th>Kategorie</th><th>Menge</th><th>MHD</th><th>Ampel</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}{p.article_number && <><br /><small className="muted">{p.article_number}</small></>}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{formatDate(p.expiry_date)}</td>
                  <td><AmpelBadge expiry={p.expiry_date} /></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><Link href={`/products/${p.id}`}>Bearbeiten</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
