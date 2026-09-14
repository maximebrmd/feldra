---
title: Änderungsprotokoll
description: Was sich geändert hat und wie sich die Vorlage weiterentwickelt.
sidebar:
  order: 11
---
## Veröffentlichungsstatus [#release-status]

Feldra ist die neue Marke des Projekts. Das Initializer-Paket heißt `feldra` und wurde noch nicht auf npm veröffentlicht. Nach der Veröffentlichung: `npx feldra` oder `npm exec feldra`. Die Maintainer verwalten die Versionierung mit Changesets.

## Veröffentlichungsablauf [#release-workflow]

```sh
npm run changeset
npm run changeset:status
npm run release:version
```

Der Versionierungsbefehl verarbeitet ausstehende Änderungsnotizen, generiert `packages/feldra/CHANGELOG.md`, aktualisiert die Versionen des Initialisierers und des Stammprojekts und aktualisiert die Lockdatei. Er veröffentlicht nichts. Teste das gepackte Artefakt vor einer ausdrücklich autorisierten Veröffentlichung auf npm.

## Lokaler Versionsverlauf [#local-release-history]


### 0.3.0

- Interaktive Datenbankauswahl zwischen Neon und Supabase per Pfeiltasten sowie `--database` für CI.
- Generierte anbieterspezifische Einrichtungsanleitungen, Kommentare zur Umgebungskonfiguration und Herkunftsmetadaten.
- RLS für alle privaten Tabellen aktivieren; serverseitige Eigentümerprüfungen und gemeinsamen Postgres/Drizzle-Zugriff beibehalten.
- Beide Datenbankoptionen anhand des gepackten npm-Releases testen.


### 0.2.0 — unveröffentlicht [#020-\-unreleased]

- Ein npm-Monorepo im Stil von next-forge mit separaten Next-Apps für Marketing und den authentifizierten Bereich, sechs gemeinsam genutzten Paketen mit direkten Quellcode-Exports und Turborepo generieren.
- Terminalabfragen zur Einrichtung und Überprüfung sowie `--preset neon` hinzufügen und die Automatisierung über `--yes` bzw. ohne TTY beibehalten. Keine nicht implementierten Anbieteroptionen.
- Das implementierte Neon/Better Auth/Stripe/Resend-Toolkit und die unveränderte Datenbankmigration beibehalten.
- Beide Produktions-Apps, die Navigation zwischen den Apps, den Task-Graphen des Workspaces und das tatsächlich gepackte Distributionspaket testen. Bestehende generierte Projekte werden nicht automatisch geändert.

### 0.1.0 — unveröffentlicht [#010-\-unreleased]

Ursprüngliche SaaS-Basis mit einer einzelnen App und gebündeltem npm-Initialisierer. In 0.2.0 durch die angeforderte Monorepo-Architektur abgelöst.
