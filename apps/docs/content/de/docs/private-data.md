---
title: Private Daten
description: Eine kleine Ressource, die zeigt, wie Autorisierung funktionieren sollte.
sidebar:
  order: 6
---
## Die Beispielressource [#the-example-resource]

Private Notizen zeigen alle Vorgänge zum Erstellen, Lesen, Aktualisieren und Löschen. Eingaben werden auf dem Server anhand strikter Zod-Schemas geprüft. Unbekannte Felder und ungültige Werte werden abgelehnt.

Jede Abfrage ist auf den authentifizierten Nutzer beschränkt. Bei Aktualisierungen und Löschungen enthält die SQL-Bedingung sowohl die Notiz-ID als auch die Eigentümer-ID. Für fremde und nicht vorhandene Datensätze wird dieselbe Antwort „Nicht gefunden“ zurückgegeben.

## Datenbankschutz [#database-protection]

Für alle Basistabellen ist Sicherheit auf Zeilenebene aktiviert, ohne Zugriffsrichtlinien für Clients. Direkter Zugriff durch Rollen, die weder Eigentümer sind noch BYPASSRLS haben, wird verweigert. Das ist relevant, wenn du das öffentliche Schema und die Data API von Supabase verwendest.

Die Anwendung verbindet sich als Datenbankeigentümer, daher bleiben serverseitige Prüfungen der Eigentümerschaft zwingend erforderlich. Deaktiviere die ungenutzte Supabase Data API und halte alle Verbindungszeichenfolgen geheim.

## Das Beispiel entfernen [#remove-the-example]

Entferne die Benutzeroberfläche für Notizen, `apps/app/src/lib/notes.ts` und `apps/app/src/app/api/notes`. Ersetze die Dashboard-Ansicht und den kostenpflichtigen Export-Link in den Einstellungen durch die eigenen Funktionen deines Produkts.

Entferne die Tabelle `note` aus `packages/database/src/schema.ts`. Erzeuge und prüfe anschließend eine neue Migration:

```sh
npm run db:generate
npm run db:migrate
```

Schreibe keine Migrationen um, die bereits auf ein bestehendes Projekt angewendet wurden. Prüfe den möglichen Datenverlust, bevor du eine Migration zum Entfernen anwendest. Behalte die Tests zur Eigentümerschaft bei und erweitere sie für deine tatsächlichen Ressourcen.
