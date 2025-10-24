// ===== RPG TERMINAL SERVER =====
// Feito para Render / GitHub / Node.js 18+

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Inicialização
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rota principal (terminal do jogador)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota do mestre
app.get("/mestre.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mestre.html"));
});

// Conexões de socket
io.on("connection", socket => {
  console.log("🟢 Um jogador se conectou.");

  // Mestre envia mensagem -> todos os terminais recebem
  socket.on("mensagem-mestre", msg => {
    io.emit("mensagem", msg);
    console.log(`📤 Mestre enviou: ${msg}`);
  });

  // Mestre aplica efeito visual
  socket.on("efeito", effect => {
    io.emit("efeito", effect);
    console.log(`⚡ Efeito aplicado: ${effect}`);
  });

  // Logs de eventos dos jogadores
  socket.on("log", data => {
    console.log(`📘 LOG do jogador: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Um jogador desconectou.");
  });
});

// Porta (Render define automaticamente, local usa 3000)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor do RPG Terminal rodando na porta ${PORT}`);
  console.log("🌐 Acesse / para jogador e /mestre.html para mestre");
});
