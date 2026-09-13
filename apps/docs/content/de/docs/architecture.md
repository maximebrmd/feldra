---
title: Architektur
description: Getrennte Apps. Gemeinsame Grundlagen. Ein stimmiger Workspace.
sidebar:
  order: 3
---
## Der Workspace [#the-workspace]

```text
apps/
  web/                  Marketing and pricing · port 3000
  app/                  Authenticated UI, APIs, webhooks · port 3001
packages/
  auth/                 Better Auth server and client
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
turbo.json
package.json
```

Das Vorlagen-Repository enthält auch diese Astro-Dokumentations-App unter `apps/docs`. Sie wird separat bereitgestellt und ist nicht in generierten SaaS-Projekten enthalten.

## Grenzen zwischen den bereitstellbaren Apps [#deployable-boundaries]

`apps/web` ist öffentlich. Die Links führen Nutzer zur Registrierung, Anmeldung und Abrechnung zu `APP_URL`. `apps/app` verwaltet das Authentifizierungs-Cookie sowie alle API- und Webhook-Routen. Getrennte Origins vermeiden eine weitreichende Cookie-Richtlinie über mehrere Subdomains hinweg.

Gemeinsame Pakete exportieren TypeScript-Quellcode. Jedes deklariert die Abhängigkeiten, die es tatsächlich verwendet. Du musst dich weder in Provider-Adapter noch in ein Plugin-Framework einarbeiten.

## Konfiguration [#configuration]

Lege den Produktnamen und die Tarife in `packages/config/index.ts` fest. Setze `APP_URL` und `WEB_URL` in den Umgebungsvariablen. Passe deinen Preis für wiederkehrende Zahlungen in Stripe an den konfigurierten Tarif an, bevor du Zahlungen entgegennimmst.

## Lokal arbeiten [#working-locally]

```sh
npm run dev
npm run dev --workspace web
npm run dev --workspace app
npm run typecheck
npm run lint
```

Turborepo führt die Workspace-Aufgaben aus und speichert Build-Ergebnisse im Cache. Jedes abgeleitete Projekt verwaltet seine eigene Lockdatei und seine internen `@repo/*`-Pakete.
