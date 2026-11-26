"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { AppUser } from "@/lib/types";
import Navbar from "./Navbar";

// Angemeldeter Benutzer (inkl. Rolle) für alle geschützten Seiten
const UserContext = createContext<AppUser | null>(null);

export function useUser(): AppUser {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser nur innerhalb von AuthGuard verwenden");
  return user;
}

// Schützt Seiten: ohne Login -> Weiterleitung zur Login-Seite
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
  }, [router]);

  if (!user) return <div className="container">Lade...</div>;

  return (
    <UserContext.Provider value={user}>
      <Navbar user={user} />
      <div className="container">{children}</div>
    </UserContext.Provider>
  );
}
