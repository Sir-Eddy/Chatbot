// Erstellen eines Arrays mit 40 Elementen für Antworten
const answers = new Array(40);
var i = 0; // Initialisierung eines Zählers

// Initialisierung einer WebSocket-Verbindung zum lokalen Server
var socket = new WebSocket('ws://127.0.0.1:8181/', 'chat');
var username; // Variable für den Benutzernamen

// Abrufen des Nachrichtenverlaufs aus dem localStorage beim Laden der Seite
var messageHistory = JSON.parse(localStorage.getItem('messageHistory')) || [];

// Eventhandler für die WebSocket-Verbindung, wenn sie geöffnet wird
socket.onopen = function () {
    // Abrufen des Benutzernamens aus localStorage oder Setzen auf "User" falls nicht vorhanden
    username = localStorage.getItem('username') || "User";
    // Senden einer Nachricht an den Server, dass der Benutzer dem Chat beigetreten ist
    socket.send('{"type": "join", "name":"' + username + '"}');
}

// Eventhandler für den Klick auf den Senden-Button
$('#sendBtn').on('click', function (e) {
    e.preventDefault(); // Verhindern des Standardverhaltens des Buttons
    var msg = $('#msg').val(); // Abrufen der Nachricht aus dem Eingabefeld
    // Senden der Nachricht an den Server
    socket.send('{"type": "msg", "msg": "' + msg + '","sender":"' + name + '"}');
    $('#msg').val(''); // Leeren des Eingabefelds
});

// Eventhandler für das Laden des Dokuments
$(document).ready(function () {
    // Abrufen des Benutzernamens aus localStorage oder Setzen auf "User" falls nicht vorhanden
    username = localStorage.getItem('username') || "User";
    // Filtern des Nachrichtenverlaufs, um nur Nachrichten des aktuellen Benutzers anzuzeigen
    var filteredMessageHistory = messageHistory.filter(message => message.name === username || message.sender === username);

    // Hinzufügen der gefilterten Nachrichten zum Nachrichtenbereich
    for (var k = 0; k < filteredMessageHistory.length; k++) {
        var message = filteredMessageHistory[k];
        var messageClass = message.name === "MegaBot" || message.sender === "MegaBot" ? 'bot-message' : 'user-message';
        var msgHTML = `<div class="${messageClass} message-block">
               <div class="sender-info">
                   <span class="sender-name">${message.name}</span>
                   <span class="message-time">${message.time}</span>
               </div>
               <div class="message-content">${message.msg}</div>
           </div>`;
        $('#msgs').append(msgHTML); // Hinzufügen der Nachricht zum Nachrichtenbereich
    }
    scrollToBottom(); // Scrollen zum Ende des Nachrichtenbereichs
});

// Eventhandler für eingehende Nachrichten über die WebSocket-Verbindung
socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data); // Parsen der eingehenden Nachricht
    var now = new Date(); // Erstellen eines neuen Datumsobjekts
    var timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(); // Formatieren der aktuellen Uhrzeit

    switch (data.type) {
        case 'msg':
            // Überprüfen, ob die Nachricht vom aktuellen Benutzer oder an den aktuellen Benutzer gerichtet ist
            if (data.name === username || data.sender === username) {
                var messageClass = data.name === "MegaBot" || data.sender === "MegaBot" ? 'bot-message' : 'user-message';
                var msgHTML = `<div class="${messageClass} message-block">
                       <div class="sender-info">
                           <span class="sender-name">${data.name}</span>
                           <span class="message-time">${timeString}</span>
                       </div>
                       <div class="message-content">${data.msg}</div>
                   </div>`;
                $('#msgs').append(msgHTML); // Hinzufügen der Nachricht zum Nachrichtenbereich

                // Hinzufügen der Nachricht zum Nachrichtenverlauf
                messageHistory.push({
                    type: 'msg',
                    name: data.name,
                    sender: data.sender,
                    msg: data.msg,
                    time: timeString
                });

                // Speichern des aktualisierten Nachrichtenverlaufs in localStorage
                localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
            }
            break;
        case 'join':
            // Aktualisieren der Benutzerliste bei einem 'join'-Ereignis
            $('#users').empty(); // Leeren der Benutzerliste
            for (var j = 0; j < data.names.length; j++) {
                if (data.names[j] !== "MegaBot" && data.names[j] !== "User") {
                    var user = `<div onclick="switchUser('${data.names[j]}')">${data.names[j]}</div>`;
                    $('#users').append(user); // Hinzufügen des Benutzers zur Benutzerliste
                }
            }
            break;
    }
    scrollToBottom(); // Scrollen zum Ende des Nachrichtenbereichs
};

// Funktion zum Scrollen zum Ende des Nachrichtenbereichs
function scrollToBottom() {
    var messages = document.getElementById('msgs');
    messages.scrollTop = messages.scrollHeight;
}
