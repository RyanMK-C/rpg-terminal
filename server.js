import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  console.log("Novo jogador conectado:", socket.id);

  // Mensagens enviadas pelo mestre
  socket.on("mensagem-mestre", text => {
    io.emit("mensagem", `???: ${text}`);
  });

  // Mensagens de jogadores
  socket.on("mensagem-jogador", text => {
    io.emit("mensagem", text);
  });

  // Efeitos visuais
  socket.on("efeito", effect => {
    io.emit("efeito", effect);
  });

  // Logs
  socket.on("log", msg => {
    console.log(`[LOG] ${msg}`);
  });

  // 🔊 Receber áudio do mestre e enviar para todos
  socket.on("audio", ({ name, data }) => {
    console.log(`[AUDIO] Recebido ${name} (${data.length} bytes)`);
    io.emit("audio", { name, data });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
