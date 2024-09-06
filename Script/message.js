// script.js

const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

let responses = {};

// Lädt die Fragen und Antworten aus der JSON-Datei
fetch('./Data/responses.json')
    .then(response => response.json())
    .then(data => {
        responses = data;
    })
    .catch(error => {
        console.error('Fehler beim Laden der Daten:', error);
    });

chatForm.addEventListener('submit', function(event) {
    event.preventDefault();
    if (recordedChunks.length > 0) {
        // Sprachnachricht senden und direkt Bot-Antwort auslösen
        sendVoiceMessage();
    } else {
        const userMessage = userInput.value.toLowerCase();
        addMessage(userMessage, 'userMessage', 'Ich');
        userInput.value = '';

        // Hier erfolgt die automatische Antwort
        setTimeout(() => {
            const botReply = generateBotReply(userMessage);
            addMessage(botReply, 'botMessage', 'Bot');
        }, 1000); // Verzögerung der Antwort um 1 Sekunde
    }
});

function addMessage(message, className, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    
    // Create the sender container
    const senderContainer = document.createElement('div');
    senderContainer.className = 'message-sender-container';
    senderContainer.innerHTML = `<span class="message-sender">${sender}</span>`;

    messageElement.innerHTML = `
        <span class="message-text">${message}</span>`;
    
    // Append sender container to message element
    messageElement.appendChild(senderContainer);

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scrollt automatisch nach unten
}


function generateBotReply(userMessage) {
    for (let key in responses) {
        if (userMessage.includes(key)) {
            return responses[key];
        }
    }
    return 'Das habe ich nicht verstanden. Kannst du das bitte wiederholen?';
}

// Sprachnachricht
let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.getElementById('recordBtn');
const startRecognitionBtn = document.getElementById('startRecognitionBtn');

startRecognitionBtn.addEventListener('mousedown', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            // Füge die "recording" Klasse hinzu, wenn das Mikrofon aktiv ist
            startRecognitionBtn.classList.add('recording');

            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onerror = (error) => {
                console.error('Fehler beim Aufnehmen der Sprachnachricht:', error);
            };
        })
        .catch(err => {
            console.error('Fehler beim Zugriff auf das Mikrofon:', err);
        });
});

startRecognitionBtn.addEventListener('mouseup', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        // Entferne die "recording" Klasse, wenn die Aufnahme gestoppt wird
        startRecognitionBtn.classList.remove('recording');
    }
});

function sendVoiceMessage() {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    recordedChunks = [];

    // Sprachnachricht nicht anzeigen, sondern direkt die Antwort des Bots auslösen
    const botReply = generateBotReply('sprachnachricht'); // Trigger für eine generische Antwort
    addMessage(botReply, 'botMessage', 'Bot');
}

// Spracherkennung
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = 'de-DE'; // Setze die Sprache auf Deutsch
recognition.interimResults = false;

const startRecognition = () => {
    recognition.start();
};

recognition.onresult = event => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    addMessage(transcript, 'userMessage', 'Ich');

    // Automatische Antwort des Chatbots
    setTimeout(() => {
        const botReply = generateBotReply(transcript);
        addMessage(botReply, 'botMessage', 'Bot');
    }, 1000); // Verzögerung der Antwort um 1 Sekunde
};

recognition.onerror = event => {
    console.error('Fehler bei der Spracherkennung:', event.error);
};

// Button für Spracherkennung starten
startRecognitionBtn.addEventListener('click', startRecognition);