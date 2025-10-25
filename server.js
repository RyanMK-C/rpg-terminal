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

app.use(express.static(path.join(__dirname, "public")));

// 🔹 Cria pasta para uploads de áudio
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔹 Configura multer para MP3
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

// 🔹 Endpoint de upload do mestre
app.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");
  const fileName = req.file.filename;
  console.log(`🎵 Mestre enviou áudio: ${fileName}`);
  io.emit("play-audio", fileName);
  res.send({ ok: true, file: fileName });
});

// 🔹 Lógica original
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

  socket.on("efeito", effect => io.emit("efeito", effect));
  socket.on("log", msg => console.log(`[LOG] ${msg}`));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
