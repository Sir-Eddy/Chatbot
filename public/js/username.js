window.onload = function () {
    // Überprüfen, ob bereits ein Benutzername im localStorage gespeichert ist
    var storedName = localStorage.getItem('username');
    if (!storedName) {
        // Kein Benutzername gespeichert, zeige das Login-Modal an
        document.getElementById('loginModal').style.display = 'block';
    } else {
        // Benutzername ist bereits gespeichert, setze ihn im Formular
        document.getElementById('chatForm').querySelector('label').innerText = storedName + ":";
    }
};

function setInitUser() {
    // Abrufen des eingegebenen Benutzernamens und Entfernen von führenden und nachfolgenden Leerzeichen
    var username = document.getElementById('username').value.trim();
    if (username.length > 0) {
        // Speichern des Benutzernamens im localStorage
        localStorage.setItem('username', username);
        // Benutzer dem Chat beitreten lassen
        joinChat(username);
        // Seite neu laden, um den neuen Benutzernamen zu verwenden
        location.reload();
        // Login-Modal ausblenden
        document.getElementById('loginModal').style.display = 'none';
        // Aktualisieren des Chat-Formulars mit dem neuen Benutzernamen
        document.getElementById('chatForm').querySelector('label').innerText = username + ":";
    } else {
        // Warnung anzeigen, wenn der Benutzername ungültig ist
        alert("Bitte einen gültigen Namen eingeben!");
    }
}

function addUser() {
    // Abrufen des neuen eingegebenen Benutzernamens und Entfernen von führenden und nachfolgenden Leerzeichen
    var username = document.getElementById('newUsername').value.trim();
    if (username.length > 0) {
        // Speichern des neuen Benutzernamens im localStorage
        localStorage.setItem('username', username);
        // Benutzer dem Chat beitreten lassen
        joinChat(username);
        // Seite neu laden, um den neuen Benutzernamen zu verwenden
        location.reload();
        // Login-Modal ausblenden
        document.getElementById('loginModal').style.display = 'none';
        // Aktualisieren des Chat-Formulars mit dem neuen Benutzernamen
        document.getElementById('chatForm').querySelector('label').innerText = username + ":";
    } else {
        // Warnung anzeigen, wenn der Benutzername ungültig ist
        alert("Bitte einen gültigen Namen eingeben!");
    }
}

function addUserBtn() {
    // Anzeigen des Modals zum Ändern des Benutzernamens
    document.getElementById('changeUserModal').style.display = 'block';
}

function switchUser(username) {
    // Speichern des neuen Benutzernamens im localStorage
    localStorage.setItem('username', username);
    // Seite neu laden, um den neuen Benutzernamen zu verwenden
    location.reload();
}

function joinChat(username) {
    // Erstellen eines Nachrichtenobjekts
    var message = {
        type: 'join',
        name: username
    };

    // Konvertieren des Nachrichtenobjekts in eine JSON-Zeichenkette
    var messageJSON = JSON.stringify(message);

    // Senden der Nachricht an den Server
    socket.send(messageJSON);
}
