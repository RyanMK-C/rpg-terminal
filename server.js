import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Configurações básicas
const app = express();
const PORT = process.env.PORT || 3000;

// Corrige __dirname no modo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Rota principal (serve o index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mestre.html"));
});

// Exemplo de rota de API (opcional, pra teste)
app.get("/api/status", (req, res) => {
  res.json({ status: "online", message: "Servidor está rodando corretamente!" });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

