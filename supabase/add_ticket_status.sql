-- Ejecutá en Supabase SQL Editor si ya tenés la base creada
ALTER TABLE "tickets_emitidos"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS "tickets_emitidos_status_idx"
    ON "tickets_emitidos" ("status");
