# MHD-Manager

Schulprojekt – Webanwendung zur digitalen Überwachung von Mindesthaltbarkeitsdaten (MHD) in einem kleinen Supermarkt.

**Technik:** Next.js, TypeScript, Supabase (PostgreSQL + Auth), Vercel

## Funktionen
- Login für Mitarbeiter (Supabase Auth)
- Dashboard mit Anzahl Produkte, bald ablaufende, abgelaufene und reduzierte Produkte
- Produkte anlegen, bearbeiten, löschen (Löschen nur Admin)
- MHD-Ampel (OK / Beobachten / Bald fällig / Heute / Abgelaufen)
- Suche und Filter nach Status
- Status: aktiv, reduziert, verkauft, entsorgt

## Einrichtung

### 1. Supabase
1. Projekt auf https://supabase.com anlegen
2. Im **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen
3. Unter **Authentication → Users** Benutzer anlegen (E-Mail + Passwort)
4. Admin festlegen: `update profiles set role = 'admin' where name = 'deine@mail.de';`

### 2. Lokal starten
```bash
npm install
cp .env.local.example .env.local   # URL und Anon-Key aus Supabase eintragen (Settings → API)
npm run dev
```
Dann http://localhost:3000 öffnen.

### 3. Deployment (Vercel)
1. Projekt auf GitHub hochladen
2. Auf https://vercel.com importieren
3. Umgebungsvariablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` eintragen
4. Deploy

## MHD-Ampel
| Tage bis MHD | Anzeige |
|---|---|
| > 14 | OK (grün) |
| 7–14 | Beobachten (gelb) |
| 1–6 | Bald fällig (orange) |
| 0 | Heute (rot) |
| < 0 | Abgelaufen (schwarz) |

## Ordnerstruktur
```
app/
  login/            Anmeldung
  dashboard/        Übersicht
  products/         Produktliste
  products/new/     Produkt anlegen
  products/[id]/    Produkt bearbeiten
components/         Navbar, AuthGuard, ProductForm
lib/                Supabase-Client, MHD-Logik, Typen
supabase/schema.sql Datenbank
```

## Team
- Projektleitung / Datenbank / Auth / Deployment: ___
- Frontend (Seiten, Design, Navigation): ___
- Logik & Tests (Ampel, Filter, Validierung, Doku): ___
