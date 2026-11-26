"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "./Navbar";

// Schützt Seiten: ohne Login -> Weiterleitung zur Login-Seite
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else setOk(true);
    });
  }, [router]);

  if (!ok) return <div className="container">Lade...</div>;

  return (
    <>
      <Navbar />
      <div className="container">{children}</div>
    </>
  );
}
