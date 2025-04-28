// Script para fazer a descarga total da API TripAdvisor e persistir no banco (PostgreSQL)
import dotenv from 'dotenv';
import pg from 'pg';

// Usar require dinamicamente para compatibilidade CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const API_HOST = 'tripadvisor16.p.rapidapi.com';
const API_KEY = process.env.RAPIDAPI_KEY;
const LOCATION_IDS = [
  '304554', // Mumbai
  '293928', // Nova York
  '186338', // Paris
  '255060', // Tóquio
  '60745',  // São Paulo
  '298184', // Londres
  '274856', // Roma
  '35805',  // Barcelona
  '255100', // Bangkok
  '28970',  // Amsterdã
  '298460', // Dubai
  '295424', // Istambul
  '294265', // Lisboa
  '187147', // Veneza
  '298564', // Praga
  '187870', // Berlim
  '215605', // Sydney
  '255070', // Seul
  '188590', // Buenos Aires
  '298463', // Abu Dhabi
  '312660', // Cidade do Cabo (África do Sul)
  '293916'  // Chiang Mai (Tailândia)
];
const PAGES_PER_LOCATION = 10;

async function fetchAndStore(locationId, page = 1) {
  const url = `https://${API_HOST}/api/v1/restaurant/searchRestaurants?locationId=${locationId}&page=${page}`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    const json = await res.json();
    const dataList = json?.data?.data;

    if (!Array.isArray(dataList)) {
      console.warn(`⚠️ Página ${page} para location ${locationId} retornou resposta inválida`);
      return;
    }

    for (const item of dataList) {
      await client.query(
        `INSERT INTO restaurantes (location_id, nome, categoria, nota, imagem_url, avaliacao_json)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ON CONSTRAINT unique_location_nome DO NOTHING`,
        [
          item.locationId,
          item.name,
          item.establishmentTypeAndCuisineTags?.[0] || 'Restaurante',
          item.averageRating,
          item.heroImgUrl,
          JSON.stringify(item),
        ]
      );
    }

    console.log(`✅ Página ${page} para location ${locationId} armazenada`);
  } catch (err) {
    console.error(`❌ Erro na página ${page} (location ${locationId}):`, err.message);
  }
}

async function runFullExtraction() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS restaurantes (
      location_id TEXT,
      nome TEXT,
      categoria TEXT,
      nota NUMERIC,
      imagem_url TEXT,
      avaliacao_json JSONB
    );
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname = 'unique_location_nome'
      ) THEN
        CREATE UNIQUE INDEX unique_location_nome ON restaurantes(location_id, nome);
      END IF;
    END $$;
  `);

  for (const locationId of LOCATION_IDS) {
    // for (let page = 1; page <= PAGES_PER_LOCATION; page++) {
    //   await fetchAndStore(locationId, page);
    //   await new Promise((r) => setTimeout(r, 500)); // evitar rate limit
    // }
  }
  await client.end();
  console.log('🚫 Descarga interrompida (✋Economizar API).');
  //console.log('🚀 Descarga completa.');
  
}

runFullExtraction().catch(console.error);
