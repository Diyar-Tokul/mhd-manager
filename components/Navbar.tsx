"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav>
      <div className="inner">
        <span className="brand">MHD-Manager</span>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Produkte</Link>
        <Link href="/products/new">+ Neues Produkt</Link>
        <button onClick={logout}>Abmelden</button>
      </div>
    </nav>
  );
}
