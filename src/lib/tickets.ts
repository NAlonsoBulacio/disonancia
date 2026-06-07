import { MAX_TICKETS_PER_EMAIL } from "./config";
import { prisma } from "./prisma";

export async function getTicketCountForEmail(email: string) {
  return prisma.ticket.count({ where: { email } });
}

export async function getRemainingTicketsForEmail(email: string) {
  const used = await getTicketCountForEmail(email);
  return Math.max(0, MAX_TICKETS_PER_EMAIL - used);
}

export async function getTicketsForEmail(email: string) {
  return prisma.ticket.findMany({
    where: { email },
    orderBy: { ticketNumber: "asc" },
  });
}

export async function getAllTickets() {
  return prisma.ticket.findMany({
    orderBy: { ticketNumber: "asc" },
  });
}

export async function getTicketStats() {
  const [total, emails] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.findMany({
      distinct: ["email"],
      select: { email: true },
    }),
  ]);

  return {
    total,
    uniqueEmails: emails.length,
  };
}

async function getNextTicketNumber() {
  const last = await prisma.ticket.findFirst({
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  return (last?.ticketNumber ?? 0) + 1;
}

export async function claimTickets(email: string, quantity: number) {
  const remaining = await getRemainingTicketsForEmail(email);

  if (quantity < 1 || quantity > remaining) {
    return {
      ok: false as const,
      error:
        remaining === 0
          ? "Ya alcanzaste el límite de 3 tickets por correo."
          : `Solo podés sacar ${remaining} ticket(s) más con este correo.`,
      remaining,
    };
  }

  const startNumber = await getNextTicketNumber();
  const tickets = Array.from({ length: quantity }, (_, i) => ({
    ticketNumber: startNumber + i,
    email,
  }));

  const created = await prisma.$transaction(
    tickets.map((ticket) => prisma.ticket.create({ data: ticket })),
  );

  return {
    ok: true as const,
    tickets: created,
    remaining: remaining - quantity,
  };
}
