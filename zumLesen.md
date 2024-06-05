# BE - Sicherheit - 05: JWTs

> Lernziele
> JWTs
> - HTTP ist zustandslos, jede Anfrage ist einzigartig
> - JSON Web Tokens identifizieren Anfragen von authentifizierten Benutzern
> - Antwort auf Logins mit einem signierten Token
> - Speichern des Tokens im Localstorage (Hinweis: nur zur Demonstration, nicht sicher)
> - Senden des Tokens mit der Anfrage in den Headern
> - Validierung des Tokens im Backend mit einer benutzerdefinierten Middleware


## Token-Authentifizierung

- Wir bauen Login- und Registrierungssysteme
- Der Benutzer gibt seinen Login/Passwort ein
- JS sendet eine Anfrage an `POST /login`
- Super, Login erfolgreich!

- Und jetzt?
- Der Benutzer versucht zum Beispiel `GET /reports`
- Wie weiß das Backend, dass diese neue Anfrage von einem eingeloggten Benutzer kommt?

- Das HTTP-Protokoll ist zustandslos
- Eine Anfrage hat überhaupt keine Verbindung zu vorherigen Anfragen
- Sie werden alle als Einzelpersonen ohne jegliche Verbindung zueinander verarbeitet

- Also muss `POST /login` irgendwie identifizierbare Informationen zurückgeben
- Der Browser muss diese Informationen _irgendwie_ speichern und privat halten
- Diese Informationen müssen mit nachfolgenden Anfragen gesendet werden
- Das Backend muss dann diese Informationen identifizieren
- Also müssen diese Informationen vertrauenswürdig sein!

- Es gibt viele Möglichkeiten, all dies zu tun
- Eine Möglichkeit ist die Token-Authentifizierung
- Was wir heute lernen, wird teilweise auch in echten Apps verwendet
- Aber das Wichtigste ist, das _Konzept_ zu lernen

### JWTs

- JSON Web Tokens
- Ein System zur Erstellung identifizierbarer Informationen

- Ein JWT hat drei Teile und sieht so aus `AAAA.BBBB.CCCC`
    - AAAA = Header-Teil
    - BBBB = Payload-Teil
    - CCCC = Signatur-Teil

- Der Header beschreibt das JWT, zum Beispiel welcher Hashing-Algorithmus verwendet wird
- Der Payload enthält Daten, die darin transportiert werden, jeder kann diese Daten lesen
- Die Signatur ist ein Hash 
    - Dieser wird aus dem Payload und einem geheimen Wert, der auf dem Server gespeichert ist, erstellt
    - Dies wird mit dem im Header definierten Algorithmus gemacht

- Mit dieser Struktur kann jeder den Payload-Teil lesen
    - Aber niemand kann den Payload-Teil ändern

- Server verwenden den Signatur-Hash auch, um zu überprüfen, dass dieses JWT von ihm erstellt wurde
    - Denn der geheime Teil ist nur dem Server bekannt

- Spielen wir ein bisschen mit https://jwt.io


## Zusammenfassung

- JSON Web Tokens
- Wird auf dem Server während des Logins erstellt
- Der Browser sendet es zusammen mit Anfragen
- Der Server überprüft es, um zu verifizieren, woher Anfragen kommen


## Übungen


## Selbststudium

