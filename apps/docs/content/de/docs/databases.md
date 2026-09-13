---
title: Wähle deine Datenbank
description: Neon oder Supabase. Dieselbe Postgres-Grundlage.
sidebar:
  order: 4
---
Der Initialisierer bietet Neon und Supabase zur Auswahl per Pfeiltasten und Eingabetaste an. Nichtinteraktive Befehle verwenden `--yes --database neon` oder `--yes --database supabase`. Neon ist die Standardeinstellung. Die ausgewählte Datenbank wird in `template-origin.json`, `.env.example` und `DATABASE.md` festgehalten.

Beide Optionen verwenden dasselbe Drizzle-Schema, dieselben Migrationen, denselben node-postgres-Treiber und denselben Better Auth Drizzle-Adapter. Es handelt sich um standardmäßige Postgres-Verbindungen; du brauchst weder das Supabase SDK noch Supabase Auth, einen anonymen Schlüssel oder einen Service-Role-API-Schlüssel. Die Datenbankauswahl ändert die Einrichtungsanweisungen, nicht die APIs deiner Anwendung. Der Initialisierer stellt keine Ressourcen bereit.

## Neon

Erstelle für jedes SaaS ein eigenständiges Neon-Projekt. Kopiere die gepoolte Verbindungs-URL nach `DATABASE_URL` und die direkte URL nach `DATABASE_URL_UNPOOLED`. Behalte die von Neon bereitgestellten Sicherheitsparameter für die Verbindung bei. Konfiguriere getrennte Branches/Datenbanken für Entwicklung und Produktion.

## Supabase

Erstelle für jedes SaaS ein eigenständiges Supabase-Projekt. Kopiere im Bereich **Verbinden** des Dashboards die Verbindungszeichenfolge des **Transaktions-Poolers** (Port 6543) nach `DATABASE_URL`. Verwende die **direkte Verbindung** für `DATABASE_URL_UNPOOLED` (Migrationen); nutze in einem reinen IPv4-Netzwerk stattdessen den **Sitzungs-Pooler** (Port 5432). Kopiere Host und Benutzername exakt aus dem Dashboard, füge dein Datenbankpasswort URL-kodiert ein und behalte die erforderlichen TLS-Einstellungen bei. Deaktiviere die Zertifikatsprüfung nicht, um Verbindungsfehler zu umgehen. Siehe [Supabase-Verbindungsoptionen](https://supabase.com/docs/guides/database/connecting-to-postgres).

Verwende für den Server und die Migrationen die vom Projekt bereitgestellten Zugangsdaten des Datenbankeigentümers. Der Transaktions-Pooler unterstützt keine benannten Prepared Statements; diese Vorlage erstellt keine. Füge keine `.prepare()`-Abfragen hinzu, ohne den Verbindungsmodus erneut zu prüfen. Der Server-Pool verwendet eine Verbindung pro Prozess; die Parallelität deines Deployments muss weiterhin innerhalb der Verbindungslimits deines Anbieters liegen.

Deaktiviere die ungenutzte **Daten-API** in den Supabase-Projekteinstellungen. Diese Vorlage stellt Daten ausschließlich über authentifizierte Next.js-Route-Handler bereit. Ihre Migration aktiviert Sicherheit auf Zeilenebene für alle neun Tabellen, ohne Richtlinien für Clients anzulegen. Dadurch werden Lese- und Schreibzugriffe für Rollen ohne Eigentümerstatus und ohne BYPASSRLS verweigert, selbst wenn Tabellenberechtigungen vorhanden sind. Das schützt Authentifizierungstoken, Passwort-Hashes, Abrechnungsstatus und private Notizen vor direktem Clientzugriff. Serverabfragen werden als Tabelleneigentümer ausgeführt, wodurch RLS umgangen wird; Prüfungen auf dem Server, ob Daten dem jeweiligen Benutzer gehören, bleiben daher zwingend erforderlich. Der API-Zugriff über die Supabase-Service-Role umgeht RLS ebenfalls; halte diesen Schlüssel geheim. Mache Datenbank-URLs niemals im Browser zugänglich. Siehe [Supabase-API-Sicherheit](https://supabase.com/docs/guides/api/securing-your-api) und [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Lass RLS auch für alle neu hinzugefügten Tabellen aktiviert. Wenn du die Daten-API später aktivierst, prüfe ausdrücklich die freigegebenen Schemas, Tabellenberechtigungen und Richtlinien; Better Auth-Sitzungen sind keine Supabase-JWTs. Eine Supabase Auth-Integration ist nicht enthalten.

## Einrichtung abschließen [#finish-setup]

Trage die Werte für Resend und Stripe wie unter [Einrichtung](/docs/environment/) beschrieben ein und führe dann im Stammverzeichnis des generierten Projekts Folgendes aus:

```sh
npm run db:migrate
npm run check
npm run dev
```

Halte `.env.local` geheim. Verwende für jedes Projekt und jede Umgebung unterschiedliche Zugangsdaten und Anbieterressourcen. Migrationen müssen ausgeführt werden, bevor Zugriffe auf eine neue Datenbank zugelassen werden. Test-Fixtures verwenden eine lokale Postgres-Instanz, die nach den Tests verworfen wird; eine tatsächliche Verbindung zu Neon/Supabase erfordert deine Zugangsdaten und wird durch Fixture-Tests nicht überprüft.
