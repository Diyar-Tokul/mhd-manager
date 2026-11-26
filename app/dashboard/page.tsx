"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { daysUntil, getAmpel, daysText, formatDate } from "@/lib/mhd";

export default function DashboardPage() {
  return <AuthGuard><Dashboard /></AuthGuard>;
}

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").order("expiry_date").then(({ data }) => setProducts(data || []));
  }, []);

  const active = products.filter((p) => p.status === "aktiv" || p.status === "reduziert");
  const soon = active.filter((p) => { const d = daysUntil(p.expiry_date); return d >= 0 && d <= 6; });
  const expired = active.filter((p) => daysUntil(p.expiry_date) < 0);
  const reduced = products.filter((p) => p.status === "reduziert");
  const todo = active.filter((p) => daysUntil(p.expiry_date) <= 6);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat"><div className="num">{active.length}</div>Produkte im Markt</div>
        <div className="stat warn"><div className="num">{soon.length}</div>MHD in 0–6 Tagen</div>
        <div className="stat bad"><div className="num">{expired.length}</div>Abgelaufen</div>
        <div className="stat info"><div className="num">{reduced.length}</div>Reduziert</div>
      </div>

      <h2>Jetzt prüfen</h2>
      {todo.length === 0 ? (
        <p className="box">Keine Produkte laufen in den nächsten 6 Tagen ab.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produkt</th><th>Menge</th><th>MHD</th><th>Ampel</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {todo.map((p) => {
                const a = getAmpel(p.expiry_date);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
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
