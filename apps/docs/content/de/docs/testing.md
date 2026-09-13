---
title: Tests
description: Sicherheit bei den Abläufen, auf die es ankommt.
sidebar:
  order: 8
---
## Qualitätsprüfungen [#quality-checks]

```sh
npm run check
```

Führt Ultracite-Linting, TypeScript-Prüfungen, Tests für Richtlinien und Eingaben sowie Produktionsbuilds für beide Apps aus. Für den Build brauchst du keine Zugangsdaten zu Live-Diensten.

## Datenbank-Fixtures [#database-fixtures]

```sh
npm run test:database
```

Docker startet eine isolierte lokale Postgres-Datenbank, führt Migrationen aus und testet echte Better Auth-Sitzungen, die Zuordnung von Datensätzen zu ihren Besitzern, ungültige Eingaben, RLS, signierte Webhooks, doppelte Zustellungen, Rollbacks bei Wiederholungsversuchen und den Zugriff auf Abonnements. Netzwerkaufrufe an Stripe und Resend werden durch Fixtures ersetzt.

## Browser-Abläufe [#browser-flows]

```sh
npm run test:browser
```

Erstellt Builds für beide Apps, startet lokale Produktionsserver und eine temporäre Datenbank und testet die Navigation auf der Marketingseite, Anmeldung, Onboarding, Notizen, Einstellungen, das mobile Layout, Abmeldung und den Schutz von Routen.

## Überprüfung der Anbieter [#provider-verification]

Lokale Fixtures belegen weder die Live-Verbindung zu Neon oder Supabase noch die Zustellung durch Resend, die Funktion von Stripe Checkout oder das Produktionshosting. Führe diese Prüfungen vor dem Launch mit separaten Testressourcen durch.
