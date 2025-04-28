// script_populate_destinos.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const destinos = [
  { cidade: 'Tokyo', continente: 'Ásia', pais: 'Japão' },
  { cidade: 'Kyoto', continente: 'Ásia', pais: 'Japão' },
  { cidade: 'Mumbai', continente: 'Ásia', pais: 'Índia' },
  { cidade: 'Bangkok', continente: 'Ásia', pais: 'Tailândia' },
  { cidade: 'Singapore', continente: 'Ásia', pais: 'Singapura' },
  { cidade: 'Dubai', continente: 'Ásia', pais: 'Emirados Árabes Unidos' },
  { cidade: 'Shibuya', continente: 'Ásia', pais: 'Japão' },
  { cidade: 'Shinjuku', continente: 'Ásia', pais: 'Japão' },
  { cidade: 'London', continente: 'Europa', pais: 'Reino Unido' },
  { cidade: 'Paris', continente: 'Europa', pais: 'França' },
  { cidade: 'Amsterdam', continente: 'Europa', pais: 'Holanda' },
  { cidade: 'Warsaw', continente: 'Europa', pais: 'Polônia' },
  { cidade: 'Venice', continente: 'Europa', pais: 'Itália' },
  { cidade: 'Negros Island', continente: 'América do Sul', pais: 'Filipinas' },
  { cidade: 'Nha Trang', continente: 'Ásia', pais: 'Vietnã' },
  { cidade: 'Cape Town', continente: 'África', pais: 'África do Sul' },
  { cidade: 'Constantia', continente: 'África', pais: 'África do Sul' },
  { cidade: 'Observatory', continente: 'África', pais: 'África do Sul' },
  { cidade: 'Sydney', continente: 'Oceania', pais: 'Austrália' },
  { cidade: 'Melbourne', continente: 'Oceania', pais: 'Austrália' }
];

async function populateDestinos() {
  await client.connect();

  for (const destino of destinos) {
    await client.query(
      `INSERT INTO destinos (cidade, continente, pais)
       VALUES ($1, $2, $3)
       ON CONFLICT (cidade) DO NOTHING`,
      [destino.cidade, destino.continente, destino.pais]
    );
  }

  console.log('🌎 Destinos populados com sucesso!');
  await client.end();
}

//populateDestinos().catch(console.error);
