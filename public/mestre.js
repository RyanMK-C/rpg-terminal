const socket = io();
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

function appendLog(text) {
  const line = document.createElement('div');
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
