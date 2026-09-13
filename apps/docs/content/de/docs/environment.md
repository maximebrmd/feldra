---
title: Umgebung & Anbieter
description: >-
  Verbinde deine eigenen Dienste, ohne Zugangsdaten zwischen Projekten zu
  teilen.
sidebar:
  order: 2
---
## Lokale Umgebung [#local-environment]

Die Initialisierung erstellt `.env.local` aus `.env.example` und generiert ein neues Better-Auth-Secret. Die Anbieterfelder bleiben leer. Sie werden bei der Verwendung validiert, sodass eine fehlende Konfiguration zu einem eindeutigen Fehler führt.

| Variable | Was du konfigurieren musst |
| --- | --- |
| `WEB_URL` | Origin der Marketingseite; lokal `http://localhost:3000` |
| `APP_URL` | Origin der Anwendung; lokal `http://localhost:3001` |
| `BETTER_AUTH_SECRET` | Generiertes lokales Secret; verwende für die Produktion ein anderes Secret |
| `DATABASE_URL` | Postgres-Verbindung über den Verbindungspool deines Anbieters |
| `DATABASE_URL_UNPOOLED` | Direkte Verbindung für Migrationen oder Supabase-Session-Pooler über IPv4 |
| `RESEND_API_KEY` | Schlüssel für dein eigenes Resend-Konto |
| `EMAIL_FROM` | Eine E-Mail-Adresse auf deiner verifizierten Absenderdomain |
| `STRIPE_SECRET_KEY` | Geheimer Stripe-Sandbox-Schlüssel während der Entwicklung |
| `STRIPE_WEBHOOK_SECRET` | Signatur-Secret für den tatsächlich verwendeten Listener oder Endpunkt |
| `STRIPE_PRO_PRICE_ID` | Wiederkehrender Preis, der zu deinem Tarif passt |
| `STRIPE_LIVE_MODE` | `false` für die Sandbox; `true` nur mit passenden Live-Ressourcen |

## Datenbank einrichten [#database-setup]

Folge [Wähle deine Datenbank](/docs/databases/) für Informationen zu Verbindungsmodi, TLS und Einschränkungen der Supabase Data API. Verwende für jedes SaaS unabhängige Ressourcen beim Anbieter und trenne Entwicklung und Produktion.

## Transaktionale E-Mails [#transactional-email]

Verifiziere eine Absenderdomain in Resend. Trage `RESEND_API_KEY` und `EMAIL_FROM` ein und teste anschließend eine Bestätigungs-E-Mail für die Registrierung und eine E-Mail zum Zurücksetzen des Passworts über die öffentliche Origin deiner Anwendung.

## Abonnements einrichten [#subscription-setup]

Erstelle in Stripe ein Sandbox-Produkt und einen wiederkehrenden Preis, aktiviere das Kundenportal und konfiguriere deinen Webhook-Endpunkt. Folge [Abonnements & Abrechnung](/docs/billing/) und der generierten Datei `docs/setup.md` für die genauen Events und die Berechtigungen eingeschränkter Schlüssel.

## Secrets vertraulich halten [#keep-secrets-private]

Committe niemals `.env.local`, hinterlege niemals Datenbank-Zugangsdaten in öffentlichen Umgebungsvariablen und verwende niemals die Secrets eines abgeleiteten Projekts für ein anderes SaaS. Vorschau-Deployments dürfen sich nicht mit Produktionsdaten verbinden. Nur die App mit Authentifizierung benötigt Zugangsdaten für die Anbieter.
