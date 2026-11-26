// Datenzugriff an einer Stelle: Seiten rufen nur diese Funktionen auf.
// Je nach Modus wird Supabase oder der Demo-Speicher verwendet.
import { supabase, DEMO_MODE } from "./supabase";
import { demo } from "./demo";
import { AppUser, Product, ProductInput, Role } from "./types";

function fail(message: string): never {
  throw new Error(message);
}

// ---------- Anmeldung ----------

export async function getCurrentUser(): Promise<AppUser | null> {
  if (DEMO_MODE) return demo.getUser();

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("name, role").eq("id", user.id).single();
  return {
    id: user.id,
    email: user.email || "",
    name: profile?.name || user.email || "Unbekannt",
    role: (profile?.role as Role) || "mitarbeiter",
  };
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
}

export async function signInDemo(role: Role): Promise<void> {
  demo.signIn(role);
}

export async function signOut(): Promise<void> {
  if (DEMO_MODE) return demo.signOut();
  await supabase.auth.signOut();
}

// ---------- Produkte ----------

export async function listProducts(): Promise<Product[]> {
  if (DEMO_MODE) return demo.list().sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const { data, error } = await supabase.from("products").select("*").order("expiry_date");
  if (error) fail("Produkte konnten nicht geladen werden: " + error.message);
  return (data || []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  if (DEMO_MODE) return demo.get(id);

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) fail("Produkt konnte nicht geladen werden: " + error.message);
  return data as Product | null;
}

export async function createProduct(input: ProductInput): Promise<void> {
  if (DEMO_MODE) {
    demo.create(input);
    return;
  }
  const { error } = await supabase.from("products").insert(input);
  if (error) fail("Fehler beim Speichern: " + error.message);
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<void> {
  if (DEMO_MODE) return demo.update(id, patch);

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) fail("Fehler beim Speichern: " + error.message);
}

export async function deleteProduct(id: string, user: AppUser): Promise<void> {
  if (user.role !== "admin") fail("Nur Administratoren dürfen Produkte löschen.");
  if (DEMO_MODE) return demo.remove(id);

  const { error, count } = await supabase.from("products").delete({ count: "exact" }).eq("id", id);
  if (error) fail("Löschen fehlgeschlagen: " + error.message);
  if (count === 0) fail("Löschen nicht möglich. Nur Administratoren dürfen Produkte löschen.");
}

export function resetDemoData() {
  if (DEMO_MODE) demo.reset();
}
