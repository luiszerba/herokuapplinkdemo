// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rota para buscar todos os paises únicos
app.get('/api/paises', async (req, res) => {
  try {
    const result = await client.query(`SELECT DISTINCT pais FROM restaurantes ORDER BY pais`);
    const paises = result.rows.map(row => row.pais);
    res.json(paises);
  } catch (err) {
    console.error('Erro na consulta de países:', err);
    res.status(500).json({ error: 'Erro ao consultar países' });
  }
});

// Rota para buscar restaurantes filtrados
app.get('/api/restaurantes', async (req, res) => {
  const { pais, notaMinima = 0, categoria = '', pagina = 1 } = req.query;
  const limite = 30;
  const offset = (pagina - 1) * limite;

  try {
    const values = [pais, notaMinima, `%${categoria}%`, limite, offset];
    const result = await client.query(
      `SELECT * FROM restaurantes
       WHERE pais = $1 AND nota >= $2 AND categoria ILIKE $3
       ORDER BY nota DESC
       LIMIT $4 OFFSET $5`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro na consulta de restaurantes:', err);
    res.status(500).json({ error: 'Erro ao consultar restaurantes' });
  }
});

// Servir frontend do Vite
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
