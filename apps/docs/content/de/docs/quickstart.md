---
title: Schnellstart
description: Von einem neuen Ordner zu deinem eigenen Workspace.
sidebar:
  order: 1
---
## Voraussetzungen [#prerequisites]

Verwende Node.js 24 LTS, npm und Git. Docker brauchst du nur für lokale Datenbank- und Browser-Fixtures. Um die Vorlage zu bauen oder diese Fixtures auszuführen, brauchst du keine Zugangsdaten für Anbieter.

## Quellcode holen [#get-the-source]

```sh
git clone https://github.com/maximebrmd/feldra.git feldra
cd feldra
npm ci
```

## Dein Projekt erstellen [#create-your-project]

Der Initialisierer wurde noch nicht auf npm veröffentlicht. Baue zuerst das versionierte lokale Paket:

```sh
npm run initializer:pack
```

Damit wird der Quellcode validiert und `feldra-VERSION.tgz` im Stammverzeichnis des Repositorys erstellt. Ersetze VERSION unten durch die Version aus `packages/feldra/package.json`:

```sh
npm exec --yes --package="./feldra-VERSION.tgz" -- feldra create my-new-saas
```

Wähle mit den Pfeiltasten und der Eingabetaste **Neon** oder **Supabase** aus. Der Initialisierer installiert Abhängigkeiten, schreibt lokale Umgebungsdateien und initialisiert ein neues Git-Repository. Er lehnt ein bereits vorhandenes Zielverzeichnis ab, selbst wenn es leer ist.

Für einen nicht interaktiven Durchlauf hängst du `--yes --database supabase` an den Projektnamen an. Sowohl relative Pfade als auch in Anführungszeichen gesetzte Pfade mit Leerzeichen funktionieren.

## Deine Anbieter anbinden [#connect-your-providers]

```sh
cd my-new-saas
```

Fülle `.env.local` mithilfe der generierten `DATABASE.md` und der [Anleitung zu Umgebungsvariablen](/docs/environment/) aus. Ein neues lokales Secret für Better Auth wurde bereits generiert; Zugangsdaten für Datenbank, E-Mail und Zahlungen musst du separat konfigurieren.

```sh
npm run db:migrate
npm run check
npm run dev
```

Öffne **localhost:3000** für die Marketing-Seiten und **localhost:3001** für die Anwendung mit Anmeldung.

## Nach der Veröffentlichung auf npm [#after-npm-publication]

Sobald das aktuelle Paket veröffentlicht ist, erstellst du Projekte so:

```sh
npx feldra@latest create my-new-saas
```

Verwende den öffentlichen Befehl erst, wenn das Paket ausdrücklich veröffentlicht wurde. Ein einziger Befehl erstellt das Projektgerüst und installiert die Abhängigkeiten; er erstellt keine Anbieterkonten und konfiguriert keine Zugangsdaten.

## Authentifizierung auswählen [#choose-authentication]

Nachdem du eine Datenbank ausgewählt hast, wählst du **Better Auth** (Standard) oder **Clerk**. Better Auth verwendet Resend für Bestätigungs-E-Mails und E-Mails zum Zurücksetzen des Passworts. Clerk verwendet seine verwalteten Komponenten und seinen E-Mail-Versand; in diesem Projekt sind Better Auth und Resend nicht enthalten.

Für CI fügst du dem lokalen Initialisierungsbefehl `--auth clerk` oder `--auth better-auth` hinzu. Kombiniere eine der beiden Optionen mit `--database neon` oder `--database supabase`. `--list-tools` listet die unterstützten Optionen auf, ohne Dateien zu erstellen. Befolge die generierte `AUTHENTICATION.md`, bevor du die Live-Authentifizierung testest. Diese Optionen erstellen unabhängige Projekte; sie migrieren keine bestehenden Nutzer zwischen Diensten.
