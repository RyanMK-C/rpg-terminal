// Ajuste automático: usa localhost quando em dev, senão usa o domínio do Render
const RENDER_HOST = "omega-terminal.onrender.com";
const useRemote = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const SOCKET_URL = useRemote ? `https://${RENDER_HOST}` : undefined;

const socket = SOCKET_URL
  ? io(SOCKET_URL, { transports: ["websocket", "polling"], secure: true, reconnection: true, reconnectionAttempts: 10, reconnectionDelay: 1500 })
  : io(); // local dev

// DOM refs
const loginDiv = document.getElementById("login");
const terminalDiv = document.getElementById("terminal");
const senhaInput = document.getElementById("senha");
const entradaInput = document.getElementById("entrada");
const tela = document.getElementById("tela");
const statusEl = document.getElementById("status");
const glitchEl = document.getElementById("glitch");

let typing = false;

// Simple append line without typing effect (for instant UI updates)
function appendLine(text = "", cls = "") {
  const el = document.createElement("div");
  if (cls) el.className = cls;
  el.textContent = text;
  tela.appendChild(el);
  scrollToBottom();
}
function scrollToBottom() {
  tela.scrollTop = tela.scrollHeight;
}

// Typing effect (returns Promise)
async function typeText(text, delay = 30) {
  typing = true;
  const line = document.createElement("div");
  tela.appendChild(line);
  for (let i = 0; i < text.length; i++) {
    line.textContent += text[i];
    await new Promise(r => setTimeout(r, delay));
    // if faster than realtime, allow small skip (not required)
  }
  typing = false;
  scrollToBottom();
}

// Socket handlers
socket.on("connect", async () => {
  statusEl.textContent = "conectado";
  appendLine(""); // spacer
  await typeText("Conexão estabelecida com o Mestre.\n", 25);
  socket.emit("log", "Jogador conectado ao terminal.");
  // show login (if hidden)
  if (loginDiv.style.display === "none" && terminalDiv.style.display === "flex") {
    // already in terminal
  } else {
    // keep on login screen until password typed
  }
});

socket.on("disconnect", () => {
  statusEl.textContent = "desconectado";
  appendLine("[Sistema] Conexão perdida. Tentando reconectar...");
});

socket.on("connect_error", (err) => {
  statusEl.textContent = "erro";
  appendLine(`[Sistema] Erro de conexão: ${err && err.message ? err.message : err}`);
});

// Messages from mestre
socket.on("mensagem", async text => {
  // mensagens podem ter \n; garante que rodamos efeito
  await typeText(text + "\n", 20);
});

// Efeitos visuais do mestre
socket.on("efeito", effect => {
  switch (effect) {
    case "glitch": showGlitch(); break;
    case "alerta": alertEffect(); break;
    case "limpar": tela.innerHTML = ""; break;
    default: appendLine(`[Efeito desconhecido: ${effect}]`); break;
  }
});

// small visual helpers
function showGlitch() {
  glitchEl.style.display = "block";
  setTimeout(() => { glitchEl.style.display = "none"; }, 1500);
}

function alertEffect() {
  let flashes = 0;
  const iv = setInterval(() => {
    document.body.style.backgroundColor = (document.body.style.backgroundColor === "black") ? "#400000" : "black";
    flashes++;
    if (flashes >= 8) {
      clearInterval(iv);
      document.body.style.backgroundColor = "black";
    }
  }, 120);
}

// LOGIN logic (senha: Ozymandias)
senhaInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  const val = senhaInput.value.trim();
  if (!val) return;
  if (val === "Ozymandias") {
    // success
    loginDiv.style.display = "none";
    terminalDiv.style.display = "flex";
    entradaInput.focus();
    await typeText("Acesso concedido. Bem-vindo, jogador.\n", 28);
    socket.emit("log", "Jogador autenticado com sucesso.");
  } else {
    await typeText("Senha incorreta. Tente novamente.\n", 28);
    senhaInput.value = "";
    socket.emit("log", "Tentativa de acesso com senha incorreta.");
  }
});

// input/commands
entradaInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const cmd = entradaInput.value.trim();
  if (!cmd) return;
  // mostra no terminal
  appendLine(`> ${cmd}`);
  // envia ao servidor para log/arbitragem
  socket.emit("log", `Comando do jogador: ${cmd}`);
  // Lógica local de comandos (exemplos)
  if (cmd.toLowerCase() === "limpar") {
    tela.innerHTML = "";
  } else if (cmd.toLowerCase() === "glitch") {
    showGlitch();
  } else if (cmd.toLowerCase() === "ajuda" || cmd.toLowerCase() === "help") {
    appendLine("Comandos locais: limpar, glitch, ajuda");
  } else {
    // comando sem efeito local — envia ao mestre opcionalmente:
    socket.emit("mensagem-mestre", `[Pedido do jogador] ${cmd}`);
  }
  entradaInput.value = "";
  scrollToBottom();
});

// Inicial message while aguardando conexão/login
(async function initIntro(){
  appendLine(""); // spacer to keep layout neat
  await typeText("Conectando ao servidor do Mestre...", 45);
  appendLine(""); // newline
})();
