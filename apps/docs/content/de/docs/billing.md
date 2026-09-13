---
title: Abonnements & Abrechnung
description: >-
  Checkout, Kundenverwaltung und kostenpflichtiger Zugriff, der auf dem Server
  durchgesetzt wird.
sidebar:
  order: 7
---
## Starte mit einer Stripe-Sandbox [#start-with-a-stripe-sandbox]

Erstelle ein Pro-Produkt und einen monatlich wiederkehrenden Preis, der zu `packages/config/index.ts` passt. Konfiguriere `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID` und `STRIPE_LIVE_MODE=false`. Aktiviere das Kundenportal.

Jedem Nutzer sind genau ein Abrechnungsdatensatz und eine serverseitig erstellte Zuordnung zu einem Stripe-Kunden zugeordnet. Der Server akzeptiert eine übermittelte Kunden-ID niemals als Nachweis der Zugehörigkeit.

## Checkout und Portal [#checkout-and-portal]

Die Checkout-Route verarbeitet Vorgänge für denselben Abrechnungsdatensatz nacheinander, verwendet stabile Idempotenzschlüssel, nutzt offene Sitzungen erneut und lehnt ein zweites Abonnement ab, das noch keinen endgültigen Status erreicht hat. Die Verwaltung der Abonnements erfolgt über das Kundenportal.

## Signierte Webhooks mit Wiederholungsversuchen [#signed-retryable-webhooks]

Der Webhook-Endpunkt liegt auf dem Origin der Anwendung:

```text
/api/webhooks/stripe
```

Er prüft den unveränderten Request-Body, die Stripe-Signatur, die Zeitstempeltoleranz und den Sandbox-/Live-Modus. Bei unterstützten Ereignissen wird der Abrechnungsdatensatz gesperrt, ein eindeutiger Empfangsnachweis eingefügt, der aktuelle Abonnementstatus von Stripe abgerufen und der erfasste Zustand innerhalb einer Transaktion gespeichert.

Doppelte Ereignis-IDs bewirken nichts. Bei Fehlern werden Empfangsnachweis und Zustand zurückgerollt, damit Wiederholungsversuche erfolgreich sein können. Bei Ereignissen, die in falscher Reihenfolge eintreffen, wird der aktuelle Zustand beim Anbieter abgeglichen, statt den Ereigniszeitstempeln zu vertrauen.

## Kostenpflichtigen Zugriff durchsetzen [#enforce-paid-access]

Der Beispiel-Endpunkt `/api/notes/export` ist ausschließlich für Pro-Nutzer verfügbar. Er gleicht den Stripe-Zustand ab, bevor er den Zugriff auf dem Server prüft. Eine Checkout-Erfolgs-URL gewährt keinen Zugriff.

Bei einem Ausfall des Anbieters schlägt die kostenpflichtige Aktion mit einer Antwort fehl, die auf die Nichtverfügbarkeit des Dienstes hinweist. Kostenlose Notizen bleiben verfügbar. Ersetze den Beispiel-Export durch deine tatsächliche kostenpflichtige Funktion und behalte dabei die serverseitige Prüfung bei.

## Lokale Webhook-Weiterleitung [#local-webhook-forwarding]

Verwende die exakte Ereignisliste und den Stripe-CLI-Befehl aus der generierten Datei `docs/setup.md`. Leite Ereignisse an `localhost:3001/api/webhooks/stripe` weiter und kopiere anschließend das Signaturgeheimnis des Listeners in `STRIPE_WEBHOOK_SECRET`.

Für den gehosteten Checkout im Live-Modus, das Portal, die Zustellung im Posteingang und vom Anbieter ausgelöste Webhooks brauchst du eigene Zugangsdaten und musst die Funktion selbst überprüfen.
