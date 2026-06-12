-- CreateTable
CREATE TABLE IF NOT EXISTS "return_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "return_tokens_token_key" ON "return_tokens"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "return_tokens_email_idx" ON "return_tokens"("email");
