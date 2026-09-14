---
title: Template-Updates
description: Halte dein Projekt unabhängig und übernimm nützliche Korrekturen.
sidebar:
  order: 10
---
Jede Initializer-Version enthält ein getestetes Monorepo und eine npm-Lockdatei. Beim Erstellen des Projektgerüsts wird nichts von GitHub heruntergeladen. `template-origin.json` hält die Version, die Voreinstellung und den Inhalts-Hash fest. Committe den Ausgangszustand jedes generierten Projekts selbst, damit du ihn später vergleichen kannst. Die internen @repo-Pakete gehören zum jeweiligen Projekt und werden nicht aus dem ursprünglichen Template heruntergeladen.

Passe `packages/config/index.ts`, die App-Texte, Metadaten und Beispielnotizen an. Jedes Projekt verwaltet seine eigenen Provider-Ressourcen und seine eigene Umgebung. Gib niemals `.env.local` oder echte Zugangsdaten weiter. Generierte Projekte haben keine Abhängigkeit von feldra und ändern sich nicht automatisch, wenn es aktualisiert wird.

Veröffentliche für zukünftige Korrekturen eine neue Initializer-Version und dokumentiere die betroffenen Dateien, Migrationen und Validierung im Changelog. Generiere temporäre Projekte aus der alten und der neuen Version, prüfe den relevanten Diff und wende einen geprüften Patch manuell an. Gleiche eigene Anpassungen gezielt ab; führe Lint-Prüfungen, Typprüfungen, Tests, den Build und die Prüfungen mit den Live-Providern des jeweiligen Projekts aus. Wende neue Migrationen in der vorgesehenen Reihenfolge an und ändere niemals eine bereits angewendete Migration. Es gibt keine automatische Synchronisierung und keine Abstraktionsschicht zum Austauschen von Providern.

## Bestehende 0.1-Projekte [#existing-01-projects]

Version 0.2 ändert die Dateisystemstruktur und das Deployment-Modell. Bestehende Projekte, einschließlich aller mit 0.1 erstellten `my-new-saas`-Verzeichnisse, werden durch die Aktualisierung dieser Basis nicht verändert. Das alte Projekt bleibt nutzbar. Generiere mit 0.2 ein **neues Zielverzeichnis**, um die neue Struktur zu erhalten; führe den Initializer nicht im alten Verzeichnis aus.

Um eigene Anpassungen manuell zu migrieren, ordne Marketing-Routen `apps/web/src/app` zu, Routen mit Authentifizierung, Komponenten und Beispielnotizen `apps/app/src` und Dienste den entsprechenden `packages`. Behalte die bestehende Datenbank und ihren Migrationsverlauf bei, wenn es sich um **dasselbe SaaS** handelt. Das SQL-Schema und die Migration bleiben durch das Refactoring unverändert. Setze APP_URL auf den Origin der App mit Authentifizierung und WEB_URL auf den Origin der Marketing-Website; aktualisiere die Webhook- und Weiterleitungseinstellungen von Stripe auf den App-Origin und teste E-Mail-Links und Sitzungen erneut. Ein neu abgeleitetes, anderes SaaS muss dagegen wie bisher unabhängige Provider-Ressourcen erhalten.

Wende für die Version mit Datenbankauswahl die Migration `0001_previous_vampiro.sql` an, bevor du eine Supabase-Datenbank zugänglich machst. Sie aktiviert RLS ohne Client-Richtlinien für alle Basistabellen. Bestehende Neon-Projekte können sie ebenfalls anwenden. Serververbindungen müssen als Tabelleneigentümer oder mit einer ausdrücklich konfigurierten BYPASSRLS-Rolle erfolgen. Behalte die ursprüngliche Migration bei; erstelle eine bestehende Datenbank nicht neu.
