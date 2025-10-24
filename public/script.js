const socket = io();

const terminal = document.body;
let typing = false;

// Função para simular texto digitando com delay
async function typeText(text, delay = 35) {
  typing = true;
  const line = document.createElement("div");
  terminal.appendChild(line);

  for (let i = 0; i < text.length; i++) {
    line.textContent += text[i];
    await new Promise(res => setTimeout(res, delay));
  }

  typing = false;
  scrollToBottom();
}

// Mantém terminal rolando pra baixo
function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

// Recebe mensagem do mestre
socket.on('mensagem', async text => {
  await typeText(text);
});

// Efeitos visuais do mestre
socket.on('efeito', effect => {
  switch (effect) {
    case 'glitch':
      glitchEffect();
      break;
    case 'alerta':
      alertEffect();
      break;
    case 'limpar':
      document.body.innerHTML = "";
      break;
  }
});

// Efeito de glitch (flicker verde)
function glitchEffect() {
  const flicker = document.createElement('div');
  flicker.style.position = 'fixed';
  flicker.style.top = 0;
  flicker.style.left = 0;
  flicker.style.width = '100vw';
  flicker.style.height = '100vh';
  flicker.style.background = 'rgba(0,255,136,0.05)';
  flicker.style.zIndex = 9999;
  flicker.style.pointerEvents = 'none';
  document.body.appendChild(flicker);

  let flashes = 0;
  const interval = setInterval(() => {
    flicker.style.background = `rgba(0,255,136,${Math.random() * 0.1})`;
    flashes++;
    if (flashes > 20) {
      clearInterval(interval);
      flicker.remove();
    }
  }, 50);
}

// Efeito de alerta piscando vermelho
function alertEffect() {
  let flashes = 0;
  const interval = setInterval(() => {
    document.body.style.backgroundColor =
      document.body.style.backgroundColor === 'black' ? '#400000' : 'black';
    flashes++;
    if (flashes > 10) {
      clearInterval(interval);
      document.body.style.backgroundColor = 'black';
    }
  }, 120);
}

// Mensagem inicial de boas-vindas
typeText("Conectando ao servidor do Mestre...", 50).then(() => {
  socket.emit('log', 'Jogador conectado ao terminal.');
});
