---
title: Änderungsprotokoll
description: Was sich geändert hat und wie sich die Vorlage weiterentwickelt.
sidebar:
  order: 11
---
## Veröffentlichungsstatus [#release-status]

Feldra ist die neue Marke des Projekts. Das Initializer-Paket heißt `feldra` und wurde noch nicht auf npm veröffentlicht. Die lokale Version bleibt bei **0.1.0**, bis eine ausdrückliche öffentliche Veröffentlichung erfolgt. Nach der Veröffentlichung: `npx feldra create`. Die Maintainer verwalten die Versionierung mit Changesets. Version-PRs, die über 0.1.0 hinausgehen, nicht mergen, solange das Paket unveröffentlicht ist.

## Veröffentlichungsablauf [#release-workflow]

```sh
npm run changeset
npm run changeset:status
npm run release:version
```

Der Versionierungsbefehl verarbeitet ausstehende Änderungsnotizen, generiert `packages/feldra/CHANGELOG.md`, aktualisiert die Versionen des Initialisierers und des Stammprojekts und aktualisiert die Lockdatei. Er veröffentlicht nichts. Lass ausstehende Changesets unberührt, bis 0.1.0 für npm autorisiert ist. Teste das gepackte Artefakt vor einer ausdrücklich autorisierten Veröffentlichung auf npm. Siehe [die Veröffentlichungsanleitung im Repository](https://github.com/maximebrmd/feldra/blob/main/docs/releasing.md).

## Lokaler Versionsverlauf [#local-release-history]

### 0.1.0 — erste öffentliche Version (noch nicht veröffentlicht) [#010-\-first-public-release-not-published-yet]

Lokaler Entwicklungsverlauf, der intern zuvor als 0.2.0/0.3.0 nummeriert war, nie auf npm veröffentlicht, plus ausstehende Changeset-Notizen:

- **Breaking:** den veröffentlichten Paket- und CLI-Namen von `create-feldra` in `feldra` umbenennen. Statt `npm create feldra` `npx feldra create` ausführen. Ein reines `npx feldra` gibt die Hilfe mit dem Befehl `create` aus.
- Die Vorlage in Feldra umbenennen. Branding, CLI-Befehle, Release-Metadaten, Tests und Dokumentation der generierten Projekte aktualisieren. Die Veröffentlichung auf npm bleibt ein separater Release-Schritt.
- Das Initializer-Paket von `initializer/` nach `packages/feldra` verschieben.
- Initializer-Releases mit Changesets und generierten Changelogs verwalten. Release-Tooling außerhalb der generierten SaaS-Projekte halten und Release-Versionen mit der gebündelten Vorlage synchronisieren.
- In generierten Projekten eine Produkt-README ausliefern statt der README des Quell-Repositorys.
- Die eigenständige Feldra-Astro-Dokumentationsseite hinzufügen und ihre App sowie ihr Tooling aus generierten SaaS-Projekten ausschließen. Eine gemeinsame TypeScript-Version verwenden, die mit der Astro-Prüfung kompatibel ist.
- Unabhängige Auswahl von Better Auth oder Clerk neben Neon oder Supabase hinzufügen. Clerk-Code und eine aufgelöste Dependency-Lockdatei bündeln, ungenutztes Better-Auth-/Resend-Tooling aus Clerk-Projekten entfernen, die Server-Autorisierung beibehalten und die Einrichtung der verwalteten Authentifizierung sowie die Grenzen der Live-Verifikation dokumentieren.
- Interaktive Datenbankauswahl zwischen Neon und Supabase per Pfeiltasten sowie `--database` für CI.
- Generierte anbieterspezifische Einrichtungsanleitungen, Kommentare zur Umgebungskonfiguration und Herkunftsmetadaten.
- RLS für alle privaten Tabellen aktivieren; serverseitige Eigentümerprüfungen und gemeinsamen Postgres/Drizzle-Zugriff beibehalten.
- Beide Datenbankoptionen anhand des gepackten npm-Releases testen.
- Ein npm-Monorepo im Stil von next-forge mit separaten Next-Apps für Marketing und den authentifizierten Bereich, sechs gemeinsam genutzten Paketen mit direkten Quellcode-Exports und Turborepo generieren.
- Terminalabfragen zur Einrichtung und Überprüfung sowie `--preset neon` hinzufügen und die Automatisierung über `--yes` bzw. ohne TTY beibehalten. Keine nicht implementierten Anbieteroptionen.
- Das implementierte Neon/Better Auth/Stripe/Resend-Toolkit und die unveränderte Datenbankmigration beibehalten.
- Beide Produktions-Apps, die Navigation zwischen den Apps, den Task-Graphen des Workspaces und das tatsächlich gepackte Distributionspaket testen. Bestehende generierte Projekte werden nicht automatisch geändert.
- Ursprüngliche SaaS-Basis mit einer einzelnen App und gebündeltem npm-Initialisierer, später durch die oben beschriebene Monorepo-Architektur abgelöst.
