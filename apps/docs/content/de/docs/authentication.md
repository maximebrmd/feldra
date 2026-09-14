---
title: Authentifizierung
description: Verifizierte Konten, sichere Sitzungen und E-Mail-Abläufe direkt integriert.
sidebar:
  order: 5
---
## Better Auth verwaltet Identitäten [#better-auth-owns-identity]

Standard ist Better Auth mit dem Drizzle-Adapter. Die Datenbankwahl ist unabhängig: Neon oder Supabase Postgres installiert kein Supabase Auth. Wähle `--auth supabase`, wenn du Supabase Auth nutzen möchtest.

Nutzer registrieren sich mit E-Mail-Adresse und Passwort, bestätigen ihre E-Mail-Adresse und melden sich an. Für den Zugriff auf die Anwendung ist die Bestätigung erforderlich. Die Abläufe für vergessene Passwörter und das Zurücksetzen von Passwörtern versenden zeitlich begrenzte Links über Resend.

## Sitzungsschutz [#session-protection]

Geschützte Layouts steuern die Navigation, aber jede geschützte Route und Seite prüft die Authentifizierung zusätzlich auf dem Server. Eigentümer-IDs stammen aus der verifizierten Sitzung, niemals aus übermittelten Formulardaten. Der Widerruf einer Sitzung wird nicht durch einen clientseitigen Cookie-Cache verzögert.

Benutzerdefinierte Routen für Datenänderungen validieren ihren Origin. Better Auth verwaltet seine eigenen CSRF-Prüfungen und vertrauenswürdigen Origins. Gib den Origin der Anwendung exakt an und verwende in der Produktion HTTPS.

## E-Mail-Konfiguration [#email-configuration]

Verifiziere eine Absenderdomain in Resend und konfiguriere `RESEND_API_KEY` und `EMAIL_FROM`. Setze `APP_URL` auf den Origin der Anwendung, damit Bestätigungs- und Zurücksetzungslinks zum richtigen Host führen.

Verwende das lokal generierte Authentifizierungsgeheimnis niemals in der Produktion wieder. Konfiguriere ein separates `BETTER_AUTH_SECRET` mit mindestens 32 Zeichen.

## Ablauf überprüfen [#verify-the-flow]

```sh
npm run test:database
```

Die Fixture-Testsuite prüft die tatsächlichen Better-Auth-Abläufe für Registrierung, E-Mail-Bestätigung, Anmeldung, Zurücksetzen des Passworts, Abmeldung und Sitzungswiderruf mit lokalem Postgres. Sie fängt den E-Mail-Versand in Tests ab. Die tatsächliche Zustellung im Posteingang musst du weiterhin mit deinem Resend-Konto überprüfen.

## Clerk- und Supabase-Auth-Alternativen [#clerk-and-supabase-auth-alternatives]

Wähle Clerk im Initialisierungsassistenten aus oder übergib `--auth clerk`. Dadurch werden Anmeldung, Registrierung, Abmeldung und Kontoeinstellungen mit Clerk sowie serverseitige Sitzungsprüfungen generiert. Nur eine verifizierte primäre E-Mail-Adresse wird akzeptiert; lokale Datensätze werden anhand der Clerk-Nutzer-ID zugeordnet und niemals automatisch anhand der E-Mail-Adresse verknüpft. Stripe-Abonnements und private Notizen behalten diese stabile Eigentümer-ID.

Erstelle eine eigenständige Clerk-Anwendung und konfiguriere ihren veröffentlichbaren und ihren geheimen Schlüssel. Clerk versendet Authentifizierungs-E-Mails, daher installiert diese Variante weder Resend noch Better Auth. Die generierte Anleitung beschreibt, wie du die E-Mail-Bestätigung verpflichtend machst, Origins für die Produktion konfigurierst und die gehosteten Abläufe validierst. Bei fehlenden Zugangsdaten wird der Zugriff verweigert und keine schlüssellose Clerk-Instanz bereitgestellt.

Die obigen Abschnitte beschreiben die Standardvariante mit Better Auth. Clerk-Projekte erhalten eine eigene Anleitung zur Einrichtung der Authentifizierung und lokale Fixture-Tests. Die tatsächlichen Abläufe für Clerk-Anmeldung, E-Mail-Bestätigung, Zurücksetzen des Passworts und Abmeldung erfordern weiterhin eine konfigurierte Entwicklungsinstanz.

## Auth.js als Alternative [#authjs-alternative]

Wähle Auth.js im Initialisierungsassistenten aus oder übergib `--auth authjs`. Dadurch werden GitHub-OAuth-Anmeldung (und eine Registrierungsseite, die denselben Ablauf startet), Abmeldung und serverseitige Sitzungsprüfungen generiert. Der erste erfolgreiche Callback erstellt den lokalen Nutzer. GitHub muss eine verifizierte primäre E-Mail-Adresse liefern; lokale Datensätze werden anhand der GitHub-Nutzer-ID (`github:{id}`) zugeordnet und niemals automatisch anhand der E-Mail-Adresse verknüpft. Stripe-Abonnements und private Notizen behalten diese stabile Eigentümer-ID.

Erstelle eine GitHub-OAuth-App für dieses Projekt. Setze die Homepage-URL auf `APP_URL` und die Autorisierungs-Callback-URL auf `APP_URL/api/auth/callback/github`. Setze `AUTH_GITHUB_ID` und `AUTH_GITHUB_SECRET`. Der Initialisierer schreibt ein lokales `AUTH_SECRET`; erzeuge einen eigenen Produktionswert. Auth.js installiert weder Resend noch Better Auth; GitHub übernimmt E-Mail-Bestätigung und Passwortwiederherstellung. Bei fehlenden Zugangsdaten wird der Zugriff verweigert und keine OAuth-App bereitgestellt.

Auth.js-Projekte erhalten eine eigene Anleitung zur Einrichtung der Authentifizierung und lokale Fixture-Tests. Die tatsächliche GitHub-OAuth-Anmeldung erfordert weiterhin eine konfigurierte OAuth-App.

Wähle Supabase Auth mit `--auth supabase`. Das ist unabhängig von `--database`: du kannst Neon für Postgres behalten und trotzdem ein Supabase-Projekt für Identitäten nutzen. Das Overlay verwendet Cookie-Sitzungen von `@supabase/ssr`, einen Next.js-Proxy zum Aktualisieren der Tokens und serverseitige `getUser()`-Prüfungen an jeder geschützten Ressource. Bestätige E-Mail im Supabase-Projekt, setze `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` und registriere `/api/auth/callback`. Füge niemals den Service-Role-Schlüssel hinzu. Supabase versendet Authentifizierungs-E-Mails; Resend und Better Auth entfallen.

Clerk-, Auth.js- und Supabase-Auth-Projekte erhalten eine eigene Anleitung zur Einrichtung der Authentifizierung und lokale Fixture-Tests. Die tatsächlichen Abläufe für Anmeldung, E-Mail-Bestätigung, Zurücksetzen des Passworts und Abmeldung erfordern weiterhin eine konfigurierte Entwicklungsinstanz.
