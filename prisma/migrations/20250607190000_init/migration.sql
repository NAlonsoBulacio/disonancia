-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tickets_emitidos" (
    "id" TEXT NOT NULL,
    "ticketNumber" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_emitidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_codes_email_idx" ON "verification_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_email_idx" ON "sessions"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tickets_emitidos_ticketNumber_key" ON "tickets_emitidos"("ticketNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tickets_emitidos_email_idx" ON "tickets_emitidos"("email");
