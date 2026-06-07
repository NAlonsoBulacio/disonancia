import { randomBytes, randomInt } from "crypto";
import { CODE_EXPIRY_MINUTES, SESSION_EXPIRY_HOURS } from "./config";
import { prisma } from "./prisma";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateCode() {
  return String(randomInt(100000, 999999));
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function createVerificationCode(email: string) {
  const normalized = normalizeEmail(email);
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  await prisma.verificationCode.deleteMany({ where: { email: normalized } });
  await prisma.verificationCode.create({
    data: { email: normalized, code, expiresAt },
  });

  return code;
}

export async function verifyCode(email: string, code: string) {
  const normalized = normalizeEmail(email);
  const record = await prisma.verificationCode.findFirst({
    where: { email: normalized, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return null;
  }

  await prisma.verificationCode.deleteMany({ where: { email: normalized } });

  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.session.deleteMany({ where: { email: normalized } });
  await prisma.session.create({
    data: { token, email: normalized, expiresAt },
  });

  return { token, email: normalized, expiresAt };
}

export async function getSession(token: string) {
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}
