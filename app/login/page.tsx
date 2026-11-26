"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login() {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
    else router.push("/dashboard");
  }

  return (
    <div className="login box">
      <h1>MHD-Manager</h1>
      <p>Bitte melde dich an.</p>
      <label>E-Mail</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Passwort</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && login()} />
      {error && <p className="error">{error}</p>}
      <div className="row"><button onClick={login}>Anmelden</button></div>
    </div>
  );
}
