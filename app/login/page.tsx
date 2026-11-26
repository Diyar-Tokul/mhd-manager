"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInDemo } from "@/lib/api";
import { DEMO_MODE } from "@/lib/supabase";
import { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Bitte E-Mail und Passwort eingeben.");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  async function demoLogin(role: Role) {
    await signInDemo(role);
    router.push("/dashboard");
  }

  if (DEMO_MODE) {
    return (
      <div className="login box">
        <h1>MHD-Manager</h1>
        <p>Demo-Modus: Es ist keine Supabase-Datenbank verbunden. Die App läuft mit Testdaten im Browser.</p>
        <div className="row">
          <button onClick={() => demoLogin("mitarbeiter")}>Als Mitarbeiter anmelden</button>
          <button className="grey" onClick={() => demoLogin("admin")}>Als Admin anmelden</button>
        </div>
      </div>
    );
  }

  return (
    <form className="login box" onSubmit={login}>
      <h1>MHD-Manager</h1>
      <p>Bitte melde dich an.</p>
      <label htmlFor="email">E-Mail</label>
      <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="pw">Passwort</label>
      <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row"><button type="submit" disabled={loading}>{loading ? "Anmelden..." : "Anmelden"}</button></div>
    </form>
  );
}
