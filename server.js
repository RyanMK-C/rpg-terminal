import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Pasta de uploads
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuração do Multer (upload de MP3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "audio/mpeg") cb(null, true);
    else cb(new Error("Apenas arquivos MP3 são permitidos!"));
  }
});

// Endpoint para upload de MP3
app.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");
  const fileName = req.file.filename;
  console.log(`🎵 Arquivo recebido: ${fileName}`);
  io.emit("play-audio", fileName);
  res.send({ ok: true, file: fileName });
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Sistema de mensagens e efeitos
io.on("connection", socket => {
  console.log("Novo jogador conectado:", socket.id);

  socket.on("mensagem", data => io.emit("mensagem", data));
  socket.on("efeito", data => io.emit("efeito", data));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
