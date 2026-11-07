# Mein Planer

Ein persönlicher, offlinefähiger Kalender als installierbare PWA.

## Funktionen

- Monatskalender mit übersichtlicher mittlerer Dichte und bis zu zwei Terminen pro Tag
- Tagesdetails, Aufgaben und Kategorien
- Termine und Aufgaben werden lokal im Browser gespeichert
- Wiederholungen für Termine: wöchentlich, monatlich und jährlich; jeweils optional bis zu einem Enddatum
- Bestehende Einträge ohne Wiederholung bleiben normale Einzeltermine
- Offline-App-Shell über den Service Worker

## Wiederholungen

Beim Erstellen eines Termins kann eine wöchentliche, monatliche oder jährliche Wiederholung gewählt werden. Wöchentliche Termine folgen dem Wochentag des ersten Termins, monatliche dem Kalendertag und jährliche dem Datum. Ein optionales Enddatum begrenzt die Serie.

Eine Serie wird als ein Eintrag gespeichert; ihre Vorkommen erscheinen im Kalender und in den Tagesdetails. Bearbeiten und Löschen wirken auf die ganze Serie. Einzelne Vorkommen können nicht separat geändert oder gelöscht werden.

## Veröffentlichung und Daten

Die PWA benötigt HTTPS, zum Beispiel GitHub Pages. Beim ersten Besuch mit Internetverbindung wird die Offline-App-Shell eingerichtet. Termine und Kategorien bleiben lokal auf dem jeweiligen Gerät beziehungsweise im Browser gespeichert; es gibt keine Synchronisation oder automatische Cloud-Sicherung. Browserdaten oder die Web-App daher nicht löschen, wenn Einträge erhalten bleiben sollen.
