'use strict'

// Importieren der WebSocketClient-Bibliothek
var WebSocketClient = require('websocket').client

// Definition der Klasse bot
class bot {
  constructor() {
    // Initialisierung von Eigenschaften
    this.history = []; // Speichern der Nachrichtengeschichte
    this.dict = require('./dictionary.json'); // Laden des Wörterbuchs
    this.sender = ""; // Sender der Nachricht
    this.client = new WebSocketClient(); // Initialisieren des WebSocket-Clients
    this.connected = false; // Verbindungsstatus

    // Eventhandler für Verbindungsfehler
    this.client.on('connectFailed', function (error) {
      console.log('Connect Error: ' + error.toString());
    });

    // Eventhandler für erfolgreiche Verbindung
    this.client.on('connect', function (connection) {
      this.con = connection; // Speichern der Verbindung
      console.log('WebSocket Client Connected');

      // Eventhandler für Verbindungsfehler
      connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString());
      });

      // Eventhandler für Verbindungsabbruch
      connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
      });

      // Eventhandler für empfangene Nachrichten
      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          var data = JSON.parse(message.utf8Data);
          console.log('Received: ' + data.msg + ' ' + data.name);
        }
      });

      // Funktion zum Beitritt zum Gespräch
      function joinGesp() {
        if (connection.connected) {
          var joinMsg = JSON.stringify({type: "join", name: "MegaBot"});
          connection.sendUTF(joinMsg); // Senden der Beitrittsnachricht
          var inhalt = "Sitzung erfolgreich gestartet! Wie kann ich behilflich sein? Für eine kurze Übersicht über meine Fähigkeiten, schreibe 'Hilfe'.";
          var msg = JSON.stringify({type: "msg", name: "MegaBot", msg: inhalt, sender: "MegaBot"});
          console.log('Send: ' + msg);
          connection.sendUTF(msg); // Senden der Willkommensnachricht
        }
      }
      joinGesp(); // Aufrufen der Funktion zum Beitritt
    });
  }

  // Methode zum Herstellen einer Verbindung
  connect() {
    this.client.connect('ws://localhost:8181/', 'chat');
    this.connected = true; // Setzen des Verbindungsstatus
  }

  // Methode zum Posten einer Nachricht
  post(msg) {
    const randomResponses = [
      'Könntest du dies präziser formulieren? Vielleicht kann ich dann besser helfen.',
      'Entschuldigung, das habe ich nicht richtig verstanden. Könntest du deine Frage etwas klarer stellen?',
      'Ich benötige etwas mehr Information, um dir helfen zu können. Was möchtest du erklärt bekommen?',
      'Das liegt gerade etwas außerhalb meiner Verständnisbereiche. Könntest du das näher erläutern?',
      'Interessant, aber etwas kompliziert. Vielleicht versuchst du es mit einer einfacheren Formulierung?',
      'Das klingt nach einem wichtigen Thema, aber ich bin mir nicht sicher, wie ich darauf antworten soll. Hast du eine spezifischere Frage?',
      'Das ist eine gute Frage, aber leider weiß ich darüber nicht genug. Hast du vielleicht einen anderen Begriff oder eine präzisere Frage?',
      'Ich verstehe nicht ganz. Kannst du mehr Kontext geben oder den Fachbegriff genauer definieren?',
      'Kannst du deine Frage etwas vereinfachen?',
      'Manchmal sind menschliche Formulierungen für mich schwierig. Kannst du es noch einmal versuchen, vielleicht mit einem spezifischen Beispiel?',
      'Das ist eine interessante Frage. Kannst du sie etwas umformulieren, damit ich besser darauf eingehen kann?',
      'Diese Anfrage ist etwas komplex für meine aktuellen Fähigkeiten. Ich könnte meinen Entwickler um Hilfe bitten, wenn du ein wenig warten kannst.',
      'Ich bin hier, um zu helfen, aber manchmal benötige ich klarere Anweisungen. Was möchtest du genau erklärt haben?'
    ];

    const get = JSON.parse(msg);
    const nachricht = get.msg.toLowerCase();
    const name = 'MegaBot';
    let inhalt = '';
    this.sender = get.name;

    console.log('Eingehende Nachricht:', nachricht); // Konsolenausgabe der eingehenden Nachricht

    if (nachricht === "historie") {
      // Überprüfe, ob die Historie leer ist
      if (this.history.length === 0) {
        // Sende eine Nachricht, dass die Historie leer ist
        const leereHistorieMessage = JSON.stringify({
          type: "msg",
          name: name,
          msg: "Die Historie ist leer.",
          sender: this.sender
        });
        this.client.con.sendUTF(leereHistorieMessage);
      } else {
        // Sende jedes Element der Historie separat
        this.history.forEach((historieElement) => {
          const historieMessage = JSON.stringify({
            type: "msg",
            name: name,
            msg: historieElement,
            sender: this.sender
          });
          this.client.con.sendUTF(historieMessage);
        });
      }
      console.log('Historie gesendet');
      return; // Beenden der Funktion, da keine weitere Verarbeitung erforderlich ist
    }

    let found = false;
    for (const j in this.dict) {
      console.log('Überprüfe Schlüsselwort:', j); // Konsolenausgabe jedes Schlüsselworts
      if (nachricht.includes(j)) {
        console.log('Schlüsselwort gefunden:', j); // Ausgabe, wenn ein Schlüsselwort gefunden wird
        inhalt = this.dict[j];
        found = true;
        this.history.push(inhalt);
        break;
      }
    }

    if (!found && nachricht !== "historie") {
      console.log('Kein Schlüsselwort gefunden, wähle zufällige Antwort.');
      inhalt = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }
    const msgToSend = `{"type": "msg", "name": "${name}", "msg": "${inhalt}", "sender": "${this.sender}"}`;
    console.log('Send: ' + msgToSend);
    this.client.con.sendUTF(msgToSend);
  }
}

// Exportieren der bot-Klasse als Modul
module.exports = bot
