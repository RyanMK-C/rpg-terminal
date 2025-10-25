const socket = io("https://omega-terminal.onrender.com", {
  transports: ["websocket", "polling"],
  secure: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const log = document.getElementById('log');
const msg = document.getElementById('msg');
const sendBtn = document.getElementById('send');
const effectSelect = document.getElementById('effect');
const applyBtn = document.getElementById('applyEffect');

// Envia mensagem para todos os jogadores conectados
sendBtn.addEventListener('click', () => {
  const text = msg.value.trim();
  if (text !== "") {
    socket.emit('mensagem-mestre', text);
    appendLog(`> Enviado: ${text}`);
    msg.value = "";
  }
});

// Aplica efeito visual no terminal dos jogadores
applyBtn.addEventListener('click', () => {
  const effect = effectSelect.value;
  if (effect !== "") {
    socket.emit('efeito', effect);
    appendLog(`> Efeito aplicado: ${effect}`);
  }
});

// Mostra logs de retorno
socket.on('log', data => {
  appendLog(`[LOG] ${data}`);
});

// Função de log
function appendLog(text) {
  const line = document.createElement('div');
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

// === Upload de áudio do mestre ===
const audioInput = document.getElementById("audiofile");
const sendAudioBtn = document.getElementById("sendAudio");

sendAudioBtn?.addEventListener("click", async () => {
  if (!audioInput.files.length) {
    appendLog("⚠️ Nenhum arquivo selecionado.");
    return;
  }

  const file = audioInput.files[0];
  const formData = new FormData();
  formData.append("audio", file);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Falha no upload");
    appendLog(`🎵 Áudio "${file.name}" enviado com sucesso.`);
  } catch (err) {
    appendLog("Erro ao enviar áudio: " + err.message);
  }
});
