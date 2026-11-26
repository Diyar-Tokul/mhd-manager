"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AmpelBadge from "@/components/AmpelBadge";
import StatusBadge from "@/components/StatusBadge";
import { listProducts, updateProduct, resetDemoData } from "@/lib/api";
import { DEMO_MODE } from "@/lib/supabase";
import { Product, Status, isInMarket } from "@/lib/types";
import { AMPEL_STUFEN, daysUntil, discountSuggestion, formatDate, getAmpel } from "@/lib/mhd";

export default function DashboardPage() {
  return <AuthGuard><Dashboard /></AuthGuard>;
}

function Dashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    listProducts().then(setProducts).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function quickStatus(p: Product, status: Status) {
    try {
      await updateProduct(p.id, { status });
      setMessage(`„${p.name}“ wurde als ${status} markiert.`);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error) return <p className="error box">{error}</p>;
  if (!products) return <p>Lade...</p>;

  const active = products.filter(isInMarket);
  const soon = active.filter((p) => { const d = daysUntil(p.expiry_date); return d >= 0 && d <= 6; });
  const expired = active.filter((p) => daysUntil(p.expiry_date) < 0);
  const reduced = products.filter((p) => p.status === "reduziert");
  const todo = active.filter((p) => daysUntil(p.expiry_date) <= 6);

  // Verteilung der Produkte im Markt auf die Ampelstufen
  const counts = AMPEL_STUFEN.map((s) => ({ ...s, count: active.filter((p) => getAmpel(p.expiry_date).color === s.color).length }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <Link href="/products" className="stat"><div className="num">{active.length}</div>Produkte im Markt</Link>
        <Link href="/products?ampel=orange" className="stat warn"><div className="num">{soon.length}</div>MHD in 0–6 Tagen</Link>
        <Link href="/products?ampel=black" className="stat bad"><div className="num">{expired.length}</div>Abgelaufen</Link>
        <Link href="/products?status=reduziert" className="stat info"><div className="num">{reduced.length}</div>Reduziert</Link>
      </div>

      <div className="box">
        <strong>MHD-Ampel im Überblick</strong>
        <div className="bars">
          {counts.map((c) => (
            <Link key={c.color} href={`/products?ampel=${c.color}`} className="bar-row">
              <span className="bar-label">{c.label}</span>
              <span className="bar-track"><span className={`bar-fill ${c.color}`} style={{ width: `${(c.count / max) * 100}%` }} /></span>
              <span className="bar-count">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <h2>Jetzt prüfen</h2>
      {message && <p className="success">{message}</p>}
      {todo.length === 0 ? (
        <p className="box">Keine Produkte laufen in den nächsten 6 Tagen ab.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produkt</th><th>Menge</th><th>MHD</th><th>Ampel</th><th>Vorschlag</th><th>Status</th><th>Aktion</th></tr></thead>
            <tbody>
              {todo.map((p) => {
                const days = daysUntil(p.expiry_date);
                const v = discountSuggestion(days);
                return (
                  <tr key={p.id}>
                    <td><Link href={`/products/${p.id}`}>{p.name}</Link></td>
                    <td>{p.quantity}</td>
                    <td>{formatDate(p.expiry_date)}</td>
                    <td><AmpelBadge expiry={p.expiry_date} /></td>
                    <td>{v?.text}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="actions">
                      {days < 0 ? (
                        <button className="small grey" onClick={() => quickStatus(p, "entsorgt")}>Entsorgt</button>
                      ) : p.status !== "reduziert" ? (
                        <button className="small" onClick={() => quickStatus(p, "reduziert")}>Reduzieren</button>
                      ) : (
                        <button className="small grey" onClick={() => quickStatus(p, "verkauft")}>Verkauft</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {DEMO_MODE && (
        <p className="hint">
          <button className="link" onClick={() => { resetDemoData(); setMessage("Testdaten wurden zurückgesetzt."); load(); }}>
            Testdaten zurücksetzen
          </button>
        </p>
      )}
    </>
  );
}
