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

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  console.log("Novo jogador conectado:", socket.id);

  socket.on("mensagem", ({ tipo, texto }) => {
    if (tipo === "mestre") {
      io.emit("mensagem", { tipo: "mestre", texto });
      console.log(`[MESTRE]: ${texto}`);
    } else {
      io.emit("mensagem", { tipo: "jogador", texto });
      console.log(`[PLAYER]: ${texto}`);
    }
  });

  socket.on("efeito", effect => {
    io.emit("efeito", effect);
  });

  socket.on("log", msg => console.log(`[LOG] ${msg}`));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
