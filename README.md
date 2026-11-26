# MHD-Manager

Schulprojekt – Webanwendung zur digitalen Überwachung von Mindesthaltbarkeitsdaten (MHD) in einem kleinen Supermarkt.

**Technik:** Next.js 15, TypeScript, React, Supabase (PostgreSQL + Auth), Vercel, Vitest

## Warum diese Technologien?
| Technologie | Kurzbegründung |
|---|---|
| **Next.js** | Frontend und Backend in einem Framework, Routing und Build sind vorkonfiguriert → schneller Start, ideal für Vercel |
| **TypeScript** | Feste Datentypen: falsche Feldnamen oder ungültige Status-Werte fallen schon beim Programmieren auf |
| **React** | Oberfläche aus wiederverwendbaren Komponenten (Ampel-Anzeige, Formular), in Next.js bereits integriert |
| **Supabase** | Fertige PostgreSQL-Datenbank **und** Login – kein eigener Server/Login nötig; Rechte (Löschen nur Admin) direkt in der DB per Row Level Security; kostenlos |
| **GitHub** | Gemeinsamer Code-Stand für das ganze Team, Versionsverlauf, direkte Anbindung an Vercel |
| **Vercel** | Von den Next.js-Entwicklern → läuft ohne Konfiguration; automatisches Deployment bei jedem Push, HTTPS, kostenlos, kein Server zu warten |
| **Vitest** | Automatische Tests der MHD-Logik – die Ampel muss zuverlässig rechnen, sonst bleibt abgelaufene Ware im Regal |

## Funktionen
- Login für Mitarbeiter (Supabase Auth), Anzeige von Name und Rolle in der Navigation
- **Dashboard**
  - Kennzahlen: Produkte im Markt, MHD in 0–6 Tagen, abgelaufen, reduziert (anklickbar → gefilterte Liste)
  - Balkendiagramm „MHD-Ampel im Überblick“
  - Liste „Jetzt prüfen“ mit **Rabattvorschlag** und Schnellaktion (Reduzieren / Verkauft / Entsorgt)
- **Produktübersicht**
  - Suche nach Name oder EAN
  - Filter nach Status (Standard: nur Produkte im Markt), Kategorie und Ampelstufe
  - Sortierung nach MHD, Name oder Menge
  - **CSV-Export** der gefilterten Liste (Excel-kompatibel)
- Produkte anlegen und bearbeiten mit Eingabeprüfung (Pflichtfelder, ganze Menge, MHD nicht in der Vergangenheit, EAN mit 8 oder 13 Ziffern) und Ampel-Vorschau
- Rollen: Löschen nur für Admins (in der Oberfläche **und** per Row Level Security in der Datenbank)
- MHD-Ampel (OK / Beobachten / Bald fällig / Heute / Abgelaufen)
- Status: aktiv, reduziert, verkauft, entsorgt
- **Demo-Modus**: läuft ohne Supabase mit Testdaten im Browser (zum Vorführen und Testen)

## Einrichtung

### Schnellstart (Demo-Modus, ohne Datenbank)
```bash
npm install
npm run dev
```
http://localhost:3000 öffnen → „Als Mitarbeiter“ oder „Als Admin“ anmelden.
Ohne `.env.local` startet die App automatisch im Demo-Modus.

### 1. Supabase
1. Projekt auf https://supabase.com anlegen
2. Im **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen
3. Unter **Authentication → Users** Benutzer anlegen (E-Mail + Passwort)
4. Admin festlegen: `update profiles set role = 'admin' where name = 'deine@mail.de';`

### 2. Lokal mit Supabase starten
```bash
npm install
cp .env.local.example .env.local   # URL und Anon-Key aus Supabase eintragen (Settings → API)
npm run dev
```

### 3. Tests
```bash
npm test
```
Getestet werden Ampel-Grenzwerte, Tagesberechnung (Monats-/Jahreswechsel, Zeitumstellung), Rabattvorschlag, Validierung und CSV-Export.

### 4. Deployment (Vercel)
1. Repository auf https://vercel.com importieren
2. Umgebungsvariablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` eintragen
3. Deploy

## MHD-Ampel und Rabattvorschlag
| Tage bis MHD | Anzeige | Vorschlag |
|---|---|---|
| > 14 | OK (grün) | – |
| 7–14 | Beobachten (gelb) | – |
| 3–6 | Bald fällig (orange) | 20 % reduzieren |
| 1–2 | Bald fällig (orange) | 30 % reduzieren |
| 0 | Heute (rot) | 50 % reduzieren |
| < 0 | Abgelaufen (schwarz) | Aussortieren / prüfen |

Der Rabattvorschlag ist nur eine Empfehlung für die Mitarbeiter und wird nicht gespeichert.

## Ordnerstruktur
```
app/
  login/            Anmeldung (normal oder Demo)
  dashboard/        Übersicht, Ampel-Diagramm, „Jetzt prüfen“
  products/         Produktliste mit Filtern und CSV-Export
  products/new/     Produkt anlegen
  products/[id]/    Produkt bearbeiten, Schnellaktionen, Löschen (Admin)
components/         Navbar, AuthGuard (inkl. Benutzer/Rolle), ProductForm, AmpelBadge, StatusBadge
lib/
  api.ts            Datenzugriff (Supabase oder Demo) – zentrale Stelle für alle Seiten
  demo.ts           Demo-Daten im Browser (localStorage)
  mhd.ts            MHD-Logik: Tage, Ampel, Rabattvorschlag
  validation.ts     Eingabeprüfung
  csv.ts            CSV-Export
  supabase.ts       Supabase-Client, Erkennung Demo-Modus
  types.ts          Typen und Konstanten
tests/              Unit-Tests (Vitest)
supabase/schema.sql Datenbank (Tabellen, Trigger, RLS, Indizes, Testdaten)
docs/               Projektdokumentation und Berichte
```

## Team
- Projektleitung / Datenbank / Auth / Deployment: ___
- Frontend (Seiten, Design, Navigation): ___
- Logik & Tests (Ampel, Filter, Validierung, Doku): ___
