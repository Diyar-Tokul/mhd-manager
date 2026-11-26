"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/api";
import { DEMO_MODE } from "@/lib/supabase";
import { AppUser } from "@/lib/types";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Produkte" },
  { href: "/products/new", label: "+ Neues Produkt" },
];

export default function Navbar({ user }: { user: AppUser }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      {DEMO_MODE && <div className="demo-banner">Demo-Modus – Testdaten werden nur in diesem Browser gespeichert</div>}
      <nav>
        <div className="inner">
          <span className="brand">MHD-Manager</span>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>{l.label}</Link>
          ))}
          <span className="user">
            {user.name} <span className={`role ${user.role}`}>{user.role === "admin" ? "Admin" : "Mitarbeiter"}</span>
          </span>
          <button onClick={logout}>Abmelden</button>
        </div>
      </nav>
    </>
  );
}
