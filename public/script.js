const socket = io("https://omega-terminal.onrender.com", {
  transports: ["websocket", "polling"],
  secure: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const terminal = document.getElementById("tela");
const entrada = document.getElementById("entrada");

let username = "Usuário";
let role = null;

function print(text) {
  const div = document.createElement("div");
  div.textContent = text;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

// Receber mensagens
socket.on("mensagem", text => print(text));

// Efeitos visuais (mantidos)
socket.on("efeito", effect => {
  if (effect === "limpar") terminal.innerHTML = "";
});

// 🔊 Reproduzir áudio recebido do mestre
socket.on("audio", ({ name, data }) => {
  const audio = new Audio(`data:audio/mp3;base64,${data}`);
  audio.play().catch(() => console.warn("Falha ao reproduzir áudio."));
});

// Entrada de comandos
entrada.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = entrada.value.trim();
    entrada.value = "";

    // Login
    if (!role) {
      if (cmd === "Ozymandias") {
        role = "mestre";
        print("Acesso concedido: Mestre.");
      } else {
        role = "jogador";
        print("Acesso concedido: Jogador.");
      }
      return;
    }

    // Define nome
    if (cmd.startsWith("define user:")) {
      const novoNome = cmd.split(":")[1]?.trim();
      if (novoNome) {
        username = novoNome;
        print(`Nome definido como: ${username}`);
      } else {
        print("Uso correto: define user:(seu nome)");
      }
      return;
    }

    // Enviar mensagem
    if (role === "mestre") {
      socket.emit("mensagem-mestre", cmd);
      print(`???: ${cmd}`);
    } else {
      socket.emit("mensagem-jogador", `${username}: ${cmd}`);
      print(`${username}: ${cmd}`);
    }
  }
});
