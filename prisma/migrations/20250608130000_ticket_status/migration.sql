-- AlterTable
ALTER TABLE "tickets_emitidos" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tickets_emitidos_status_idx" ON "tickets_emitidos"("status");
