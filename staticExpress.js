// Importieren des bot-Moduls und der express-Bibliothek
var bot = require('./bot.js')
var express = require('express')

var app = express() // Erstellen einer express-Anwendung

// Festlegen des statischen Verzeichnisses für die Bereitstellung von Dateien
app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))

// Starten des Webservers auf Port 8081
var webserver = app.listen(8081, function () {
  var address = webserver.address()
  console.log(address)
  console.log('Server started at http://localhost:8081')
})

// Importieren der WebSocket-Server- und http-Module
var WSS = require('websocket').server
var http = require('http')

var server = http.createServer() // Erstellen eines HTTP-Servers
server.listen(8181) // Starten des Servers auf Port 8181

// Erstellen eines WebSocket-Servers und Konfigurieren der Optionen
var wss = new WSS({
  httpServer: server,
  autoAcceptConnections: false
})

var myBot = new bot() // Instanz des Bots erstellen
var connections = {} // Objekt zum Speichern der Verbindungen

// Eventhandler für eingehende WebSocket-Anfragen
wss.on('request', function (request) {
  var connection = request.accept('chat', request.origin) // Akzeptieren der WebSocket-Verbindung

  // Eventhandler für eingehende Nachrichten
  connection.on('message', function (message) {
    var name = ''

    // Durchsuchen der Verbindungen, um den Namen des Senders zu finden
    for (var key in connections) {
      if (connection === connections[key]) {
        name = key
      }
    }

    var data = JSON.parse(message.utf8Data) // Parsen der empfangenen Nachricht
    var msg = 'leer'

    var uname
    var utype
    var umsg

    // Verarbeitung der Nachricht basierend auf ihrem Typ
    switch (data.type) {
      case 'join':
        connections[data.name] = connection // Speichern der Verbindung unter dem Benutzernamen
        msg = '{"type": "join", "names": ["' + Object.keys(connections).join('","') + '"]}'
        if (myBot.connected === false) {
          myBot.connect() // Bot mit dem WebSocket-Server verbinden, falls noch nicht verbunden
        }
        break
      case 'msg':
        msg = '{"type": "msg", "name":"' + name + '", "msg":"' + data.msg + '","sender":"' + data.sender + '"}'
        utype = 'msg'
        uname = name
        umsg = data.msg
        break
    }

    // Senden der Nachricht an alle verbundenen Clients
    for (var key in connections) {
      if (connections[key] && connections[key].send) {
        connections[key].send(msg)
      }
    }

    // Weiterleiten der Nachricht an den Bot, falls der Sender nicht 'MegaBot' ist
    if (uname !== 'MegaBot' && utype === 'msg') {
      myBot.post(msg)
    }
  })
})
