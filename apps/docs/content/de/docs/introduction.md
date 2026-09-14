---
title: Einführung
description: >-
  Ein durchdachter Ausgangspunkt für das SaaS-Produkt, das du entwickeln
  möchtest.
sidebar:
  order: 0
---
Feldra vereint die wesentlichen Bestandteile eines SaaS-Produkts in einem Workspace, der dir gehört. Marketing, Authentifizierung, private Daten, Abonnements und Transaktions-E-Mails sind miteinander verbunden, damit du dich auf dein Produkt konzentrieren kannst.

## Ein Fundament, keine Plattform [#a-foundation-not-a-platform]

Dein generiertes Projekt ist ein eigenständiges Git-Repository mit eigenen Abhängigkeiten, einer eigenen Datenbank und eigenen Zugangsdaten für die Anbieter. Zur Laufzeit hängt es weder von dieser Vorlage noch von ihrem Initialisierer ab.

Die Architektur ist von next-forge inspiriert: zwei separat bereitstellbare Next.js-Apps und eine kleine Auswahl gemeinsamer Pakete, koordiniert mit Turborepo und npm-Workspaces.

## Was du bekommst [#what-you-get]

- **Eine öffentliche Website** mit Landingpage und Preisseite.
- **Eine App mit Authentifizierung** mit Registrierung, Verifizierung, Anmeldung, Passwortzurücksetzung, Onboarding und Kontoeinstellungen.
- **Private Notizen** als klar gekennzeichnetes Beispiel für CRUD mit Validierung und Autorisierung.
- **Abonnements** mit Stripe Checkout, Kundenportal, signierten Webhooks und serverseitiger Zugriffskontrolle für kostenpflichtige Funktionen.
- **Transaktions-E-Mails** über Resend.
- **Einen getesteten Workflow** mit Ultracite, TypeScript, Produktions-Builds, Datenbank-Fixtures und Browser-Prüfungen.

## Ein kleiner, bewusst gewählter Stack [#a-small-deliberate-stack]

| Bereich | Enthaltenes Tool |
| --- | --- |
| Anwendung | Next.js App Router und TypeScript |
| Datenbank | Neon oder Supabase Postgres mit Drizzle |
| Authentifizierung | Better Auth |
| Styling | Tailwind CSS und verwendete shadcn/ui-Komponenten |
| Abrechnung | Stripe |
| E-Mail | Resend |
| Qualität | Ultracite, TypeScript und Tests |

Einzelkonten und Abrechnung auf Nutzerebene bilden die Grundlage. Organisationen, KI, Warteschlangen, CMS, Analytics und Zusammenarbeit in Echtzeit gehören bewusst nicht zum Umfang.

## Leg los [#start-building]

Mit dem [Schnellstart](/docs/quickstart/) erstellst du dein erstes eigenständiges Projekt. Oder erkunde die [Architektur](/docs/architecture/), bevor du loslegst.

> Feldra ist der neue Name des Projekts. Das GitHub-Repository ist `maximebrmd/feldra`. Das Initializer-Paket heißt `feldra`. Nach der Veröffentlichung: `npx feldra create`.
