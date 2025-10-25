const socket = io("https://omega-terminal.onrender.com", {
  transports: ["websocket", "polling"],
  secure: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const msg = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const effectSelect = document.getElementById("effect");
const applyBtn = document.getElementById("applyEffect");
const audioFile = document.getElementById("audioFile");
const sendAudioBtn = document.getElementById("sendAudio");
const log = document.getElementById("log");

// Enviar mensagem
sendBtn.addEventListener("click", () => {
  const text = msg.value.trim();
  if (text) {
    socket.emit("mensagem-mestre", text);
    appendLog(`> Enviado: ${text}`);
    msg.value = "";
  }
});

// Aplicar efeito
applyBtn.addEventListener("click", () => {
  const effect = effectSelect.value;
  if (effect) {
    socket.emit("efeito", effect);
    appendLog(`> Efeito aplicado: ${effect}`);
  }
});

// 🔊 Enviar áudio
sendAudioBtn.addEventListener("click", async () => {
  const file = audioFile.files[0];
  if (!file) return alert("Selecione um arquivo de áudio primeiro.");

  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result;
    const base64 = arrayBufferToBase64(arrayBuffer);
    socket.emit("audio", { name: file.name, data: base64 });
    appendLog(`> Áudio enviado: ${file.name}`);
  };
  reader.readAsArrayBuffer(file);
});

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function appendLog(text) {
  const line = document.createElement("div");
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
