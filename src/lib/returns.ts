import { randomBytes } from "crypto";
import { EVENT, RETURN_LINK_EXPIRY_DAYS, TICKET_STATUS } from "./config";
import { normalizeEmail } from "./auth";
import { prisma } from "./prisma";
import { getTicketsForEmail, getTicketAvailability } from "./tickets";

function generateToken() {
  return randomBytes(32).toString("hex");
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function buildReturnUrl(token: string) {
  return `${getAppBaseUrl()}/devolver?token=${token}`;
}

export function buildManualReturnEmail(email: string, url: string) {
  const subject = `Liberá tus entradas — ${EVENT.name}`;
  const body = [
    `Hola,`,
    ``,
    `Si finalmente no vas a poder asistir a ${EVENT.name}, podés liberar tus entradas.`,
    ``,
    `Ingresá acá:`,
    url,
    ``,
    `Podés devolver 1, 2 o todas las entradas asociadas a ${email}.`,
    ``,
    `El enlace vence en ${RETURN_LINK_EXPIRY_DAYS} días.`,
    ``,
    `Gracias,`,
    `Ciclo disonancia`,
  ].join("\n");

  return { subject, body };
}

export async function createReturnLink(email: string) {
  const normalized = normalizeEmail(email);
  const tickets = await getTicketsForEmail(normalized);

  if (tickets.length === 0) {
    return {
      ok: false as const,
      error: "Este correo no tiene entradas para liberar.",
    };
  }

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + RETURN_LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.returnToken.deleteMany({ where: { email: normalized } });
  await prisma.returnToken.create({
    data: { token, email: normalized, expiresAt },
  });

  const url = buildReturnUrl(token);
  const emailContent = buildManualReturnEmail(normalized, url);

  return {
    ok: true as const,
    email: normalized,
    url,
    expiresAt: expiresAt.toISOString(),
    tickets: tickets.map((t) => t.ticketNumber),
    ...emailContent,
  };
}

export async function getReturnSession(token: string) {
  const record = await prisma.returnToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.returnToken.delete({ where: { id: record.id } });
    return null;
  }

  const tickets = await getTicketsForEmail(record.email);

  return {
    email: record.email,
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      createdAt: t.createdAt.toISOString(),
    })),
    expiresAt: record.expiresAt.toISOString(),
  };
}

export async function releaseTickets(token: string, quantity: number) {
  const session = await getReturnSession(token);
  if (!session) {
    return { ok: false as const, error: "Enlace inválido o vencido." };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false as const, error: "Elegí una cantidad válida." };
  }

  if (quantity > session.tickets.length) {
    return {
      ok: false as const,
      error: `Solo tenés ${session.tickets.length} entrada(s) con este correo.`,
    };
  }

  const toRelease = session.tickets
    .slice()
    .sort((a, b) => b.ticketNumber - a.ticketNumber)
    .slice(0, quantity);

  await prisma.ticket.updateMany({
    where: { id: { in: toRelease.map((t) => t.id) } },
    data: { status: TICKET_STATUS.released },
  });

  const availability = await getTicketAvailability();
  const remaining = await getTicketsForEmail(session.email);

  return {
    ok: true as const,
    released: toRelease.map((t) => t.ticketNumber).sort((a, b) => a - b),
    remaining: remaining.map((t) => t.ticketNumber),
    ...availability,
  };
}
