---
title: Deployment
description: Zwei Anwendungs-Deployments. Klare Grenzen.
sidebar:
  order: 9
---
## Stelle die SaaS-Apps bereit [#deploy-the-saas-apps]

Erstelle bei deinem Next.js-Host zwei Projekte, die mit demselben generierten Repository verbunden sind:

| Projekt | Stammverzeichnis | Zweck |
| --- | --- | --- |
| Marketing | `apps/web` | Landingpage und Preisübersicht |
| Anwendung | `apps/app` | Authentifizierung, Dashboard, APIs, Webhooks |

Installiere die Abhängigkeiten anhand der npm-Lockdatei im Stammverzeichnis und beziehe alle Workspaces ein. Aktiviere den Zugriff auf Quelldateien außerhalb des jeweiligen Projektstammverzeichnisses, damit Next.js die gemeinsam genutzten Pakete kompilieren kann. Verwende die Next.js-Voreinstellung der Plattform.

## Lege die Produktions-Origins fest [#set-production-origins]

Setze `WEB_URL` und `APP_URL` in beiden Deployments auf ihre exakten HTTPS-Origins. Hinterlege die Zugangsdaten für Datenbank, Authentifizierung, Stripe und Resend nur im Anwendungs-Deployment.

Verwende ein neues Authentifizierungs-Secret für die Produktion, eine Produktionsdatenbank, einen verifizierten Absender sowie einen Stripe-Live-Schlüssel mit dazu passendem Preis, Endpoint-Secret und Modus. Authentifizierungs-Cookies gehören zur Origin der Anwendung.

## Führe Migrationen aus [#apply-migrations]

Führe `npm run db:migrate` für die vorgesehene Datenbank aus, bevor du den Anwendungsverkehr darauf leitest. Prüfe jede Migration und sichere wichtige Daten vor Änderungen, die sie entfernen oder umwandeln könnten.

## Prüfe alles vor dem Start [#verify-before-launch]

Teste Verifizierungslinks, das Zurücksetzen von Passwörtern, den Widerruf von Sitzungen, Zugriffsberechtigungen für private Datensätze, Checkout, Änderungen im Portal und die Webhook-Zustellung in der tatsächlich gehosteten Anwendung. Die lokalen Test-Fixtures der Vorlage validieren deine Produktionskonfiguration nicht.

## Diese Dokumentationswebsite [#this-documentation-site]

Die Dokumentation von Feldra ist eine separate statische Astro-App. Führe im Stammverzeichnis des Vorlagen-Repositorys Folgendes aus:

```sh
npm run build --workspace docs
npm run preview --workspace docs
```

Die Ausgabe liegt in `apps/docs/dist`. Du kannst sie über einen statischen Host mit Verzeichnisindex-Routing und der generierten `404.html` bereitstellen. Dafür sind weder ein Server-Adapter noch Zugangsdaten eines Anbieters erforderlich. Die Dokumentations-App ist in generierten SaaS-Projekten nicht enthalten. Nichts wird automatisch bereitgestellt.
