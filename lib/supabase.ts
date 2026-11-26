import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Demo-Modus: ohne Supabase-Zugangsdaten (oder mit NEXT_PUBLIC_DEMO_MODE=true)
// läuft die App mit Testdaten im Browser (localStorage).
export const DEMO_MODE = !url || !key || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder");
