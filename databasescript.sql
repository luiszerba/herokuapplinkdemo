CREATE TABLE restaurantes (
      location_id TEXT,
      nome TEXT,
      categoria TEXT,
      nota NUMERIC,
      imagem_url TEXT,
      avaliacao_json JSONB,
      CONSTRAINT unique_location_nome UNIQUE(location_id, nome)
    );

CREATE UNIQUE INDEX IF NOT EXISTS unique_location_nome
ON restaurantes(location_id, nome);

CREATE INDEX idx_location ON restaurantes(location_id);
CREATE INDEX idx_categoria ON restaurantes(categoria);
CREATE INDEX idx_nota ON restaurantes(nota);


CREATE TABLE destinos (
  cidade TEXT PRIMARY KEY,
  continente TEXT NOT NULL,
  pais TEXT NOT NULL
);

ALTER TABLE restaurantes ADD COLUMN continente TEXT;
ALTER TABLE restaurantes ADD COLUMN pais TEXT;

UPDATE restaurantes
SET pais = (avaliacao_json->'parentGeoName')::text
WHERE pais IS NULL;
