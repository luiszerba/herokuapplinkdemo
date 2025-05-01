import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 


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

app.use(express.json()); // <- precisa estar presente

// Rota para buscar países disponíveis
app.get('/api/paises', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT DISTINCT pais FROM restaurantes WHERE pais IS NOT NULL ORDER BY pais`
    );
    res.json(result.rows.map(r => r.pais));
  } catch (err) {
    console.error('Erro na consulta de países:', err);
    res.status(500).json({ error: 'Erro ao consultar países' });
  }
});

// Rota para buscar regiões (parent_geo_name vindo do JSON)
app.get('/api/regioes', async (req, res) => {
  const { pais } = req.query;

  try {
    const result = await client.query(
      `SELECT DISTINCT (avaliacao_json->>'parentGeoName') AS parent_geo_name
       FROM restaurantes
       WHERE pais = $1 AND avaliacao_json->>'parentGeoName' IS NOT NULL
       ORDER BY parent_geo_name`,
      [pais]
    );
    res.json(result.rows.map(r => r.parent_geo_name));
  } catch (err) {
    console.error('Erro na consulta de regiões:', err);
    res.status(500).json({ error: 'Erro ao consultar regiões' });
  }
});

// Rota para buscar categorias disponíveis
app.get('/api/categorias', async (req, res) => {
  const { regiao } = req.query;
  
  try {
    const result = await client.query(
      `SELECT DISTINCT categoria FROM restaurantes WHERE avaliacao_json->>'parentGeoName' = $1 AND categoria IS NOT NULL ORDER BY categoria`,
      [regiao]
    );
  
    res.json(result.rows.map(r => r.categoria));
  } catch (err) {
    console.error('Erro na consulta de categorias:', err);
    res.status(500).json({ error: 'Erro ao consultar categorias' });
  }
});

// Rota para buscar restaurantes filtrados
app.get('/api/restaurantes', async (req, res) => {
  const { pais, regiao, notaMinima = 0, categoria = '', pagina = 1 } = req.query;

  const limit = 30;
  const offset = (pagina - 1) * limit;

  let query = `SELECT * FROM restaurantes WHERE pais = $1 AND nota >= $2`;
  let params = [pais, notaMinima];

  if (regiao) {
    params.push(regiao);
    query += ` AND avaliacao_json->>'parentGeoName' = $${params.length}`;
  }

  if (categoria) {
    params.push(categoria);
    query += ` AND categoria = $${params.length}`;
  }

  query += ` ORDER BY nota DESC NULLS LAST OFFSET $${params.length + 1} LIMIT ${limit}`;
  params.push(offset);

  try {
    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro na consulta:', err);
    res.status(500).json({ error: 'Erro ao consultar restaurantes' });
  }
});

app.post('/api/RestFavorites', async (req, res) => {
  const payload = req.body;
  const fullUrl = process.env.HEROKUEVENTS_PUBLISH_URL;

  console.log('[payload recebido]:', JSON.stringify(payload, null, 2));


  if (!fullUrl) {
    return res.status(500).json({ error: 'HEROKUEVENTS_PUBLISH_URL não definida' });
  }

  try {
    const parsedUrl = new URL(`${fullUrl}/RestFavorites`);
    const authHeader = 'Basic ' + Buffer.from(`${parsedUrl.username}:${parsedUrl.password}`).toString('base64');
    parsedUrl.username = '';
    parsedUrl.password = '';

    const response = await fetch(parsedUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    console.error('Erro ao enviar evento para Salesforce:', error);
    res.status(500).json({ error: 'Falha ao enviar evento' });
  }
});

app.get('/api/restaurantes/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const result = await client.query(
      `SELECT nome, nota, categoria, location_id, avaliacao_json, detalhes_json
       FROM restaurantes
       WHERE location_id = $1
       LIMIT 1`,
      [locationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    const row = result.rows[0];

    res.json({
      id: row.id,
      nome: row.nome,
      nota: row.nota,
      categoria: row.categoria,
      location_id: row.location_id,
      parent_geo_name: row.avaliacao_json?.parentGeoName || null,
      detalhes_json: row.detalhes_json
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes do restaurante:', err);
    res.status(500).json({ error: 'Erro ao buscar detalhes do restaurante' });
  }
});

app.get('/api/restaurantesPatchedHeroku/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const result = await client.query(
      `SELECT nome, nota, categoria, location_id, avaliacao_json, detalhes_json
       FROM restaurantes
       WHERE location_id = $1
       LIMIT 1`,
      [locationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    const row = result.rows[0];

    res.json({
      id: row.id,
      nome: row.nome,
      nota: row.nota,
      categoria: row.categoria,
      location_id: row.location_id,
      parent_geo_name: row.avaliacao_json?.parentGeoName || null,
      detalhesJson: JSON.stringify(row.detalhes_json || {}) // <- como string
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes do restaurante:', err);
    res.status(500).json({ error: 'Erro ao buscar detalhes do restaurante' });
  }
});


// Servir frontend
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
