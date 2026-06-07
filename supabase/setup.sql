-- ============================================================
-- Ciclo disonancia — Setup de base de datos en Supabase
-- Ejecutá este script en: SQL Editor → New query → Run
-- ============================================================

-- Códigos de verificación por email (temporales)
CREATE TABLE IF NOT EXISTS "verification_codes" (
    "id"         TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "code"       TEXT NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verification_codes_email_idx"
    ON "verification_codes" ("email");

-- Sesiones activas después de verificar el correo
CREATE TABLE IF NOT EXISTS "sessions" (
    "id"         TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key"
    ON "sessions" ("token");

CREATE INDEX IF NOT EXISTS "sessions_email_idx"
    ON "sessions" ("email");

-- Tickets emitidos (tabla principal)
CREATE TABLE IF NOT EXISTS "tickets_emitidos" (
    "id"           TEXT NOT NULL,
    "ticketNumber" INTEGER NOT NULL,
    "email"        TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tickets_emitidos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tickets_emitidos_ticketNumber_key"
    ON "tickets_emitidos" ("ticketNumber");

CREATE INDEX IF NOT EXISTS "tickets_emitidos_email_idx"
    ON "tickets_emitidos" ("email");

-- Registro para que Prisma sepa que la migración ya está aplicada
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    VARCHAR(36)  NOT NULL,
    "checksum"              VARCHAR(64)  NOT NULL,
    "finished_at"           TIMESTAMPTZ,
    "migration_name"        VARCHAR(255) NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMPTZ,
    "started_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "migration_name",
    "finished_at",
    "applied_steps_count"
)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'manual_setup',
    '20250607190000_init',
    now(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations"
    WHERE "migration_name" = '20250607190000_init'
);
