import dotenv from 'dotenv';
import pg from 'pg';
import fetch from 'node-fetch';
import e from 'express';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const API_HOST = 'tripadvisor16.p.rapidapi.com';
const API_KEY = process.env.VITE_RAPIDAPI_KEY;

async function getRestaurantDetails(locationId) {

    console.log(`locationId: ${locationId}`)
  
    const url = `https://${API_HOST}/api/v1/restaurant/getRestaurantDetailsV2?restaurantsId=${locationId}&currencyCode=BRL`;

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST,
    },
  });

  if (!res.ok) {
    console.error(`❌ Falha para locationId ${locationId}: ${res.status}`);
    return null;
  }

  const json = await res.json();
  return json?.data || null;
}

async function run() {
  await client.connect();

  const { rows } = await client.query(`select avaliacao_json->>'restaurantsId' as restaurantId from restaurantes where detalhes_json::text IS NULL LIMIT 3000`);

  console.log(`🔎 Restaurantes para atualizar: ${rows.length}`);
  
  for (const { restaurantid } of rows) {
    
    try {
      const detalhes = await getRestaurantDetails(restaurantid);
      if (detalhes) {
        await client.query(
          `UPDATE restaurantes SET detalhes_json = $1 WHERE avaliacao_json->>'restaurantsId' = $2`,
          [JSON.stringify(detalhes), restaurantid]
        );
        console.log(`✅ Atualizado detalhes para ${restaurantid}`);
      } else {
        console.warn(`⚠️ Detalhes não encontrados para ${restaurantid}`);
      }
    } catch (err) {
      console.error(`❌ Erro no ${restaurantid}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 600)); // Pequena pausa para não estourar rate limit
  }

  await client.end();
  console.log('🚀 Atualização concluída.');
}

run().catch(console.error);
