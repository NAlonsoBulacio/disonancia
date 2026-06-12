import { MAX_TICKETS_PER_EMAIL, MAX_TOTAL_TICKETS, TICKET_STATUS } from "./config";
import { prisma } from "./prisma";

const activeFilter = { status: TICKET_STATUS.active };

export async function getTicketCountForEmail(email: string) {
  return prisma.ticket.count({ where: { email, ...activeFilter } });
}

export async function getRemainingTicketsForEmail(email: string) {
  const used = await getTicketCountForEmail(email);
  return Math.max(0, MAX_TICKETS_PER_EMAIL - used);
}

export async function getTicketsForEmail(email: string) {
  return prisma.ticket.findMany({
    where: { email, ...activeFilter },
    orderBy: { ticketNumber: "asc" },
  });
}

export async function getAllTickets() {
  return prisma.ticket.findMany({
    orderBy: { ticketNumber: "asc" },
  });
}

export async function getActiveTicketRecipients() {
  const tickets = await prisma.ticket.findMany({
    where: activeFilter,
    orderBy: [{ email: "asc" }, { ticketNumber: "asc" }],
    select: { email: true, ticketNumber: true },
  });

  const recipients = new Map<string, number[]>();
  for (const ticket of tickets) {
    recipients.set(ticket.email, [
      ...(recipients.get(ticket.email) ?? []),
      ticket.ticketNumber,
    ]);
  }

  return Array.from(recipients, ([email, ticketNumbers]) => ({
    email,
    ticketNumbers,
  }));
}

export async function getTicketAvailability() {
  const [active, released] = await Promise.all([
    prisma.ticket.count({ where: activeFilter }),
    prisma.ticket.count({ where: { status: TICKET_STATUS.released } }),
  ]);

  const available = Math.max(0, MAX_TOTAL_TICKETS - active);

  return {
    available,
    sold: active,
    active,
    released,
    total: MAX_TOTAL_TICKETS,
  };
}

export async function getTicketStats() {
  const [availability, emails] = await Promise.all([
    getTicketAvailability(),
    prisma.ticket.findMany({
      where: activeFilter,
      distinct: ["email"],
      select: { email: true },
    }),
  ]);

  return {
    total: availability.active,
    issued: availability.sold,
    released: availability.released,
    uniqueEmails: emails.length,
    available: availability.available,
    capacity: availability.total,
  };
}

async function getNextTicketNumber(tx: Pick<typeof prisma, "ticket">) {
  const last = await tx.ticket.findFirst({
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  return (last?.ticketNumber ?? 0) + 1;
}

export async function claimTickets(email: string, quantity: number) {
  const remainingPerEmail = await getRemainingTicketsForEmail(email);

  if (quantity < 1 || quantity > remainingPerEmail) {
    return {
      ok: false as const,
      error:
        remainingPerEmail === 0
          ? "Este correo ya tiene su entrada. Solo se permite 1 ticket por correo."
          : `Solo podés sacar ${remainingPerEmail} ticket con este correo.`,
      remaining: remainingPerEmail,
      ...(await getTicketAvailability()),
    };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const active = await tx.ticket.count({ where: activeFilter });
      const availableGlobal = MAX_TOTAL_TICKETS - active;

      if (quantity > availableGlobal) {
        throw new Error(
          availableGlobal === 0
            ? "SOLD_OUT"
            : `ONLY_${availableGlobal}_LEFT`,
        );
      }

      const usedByEmail = await tx.ticket.count({
        where: { email, ...activeFilter },
      });
      if (usedByEmail + quantity > MAX_TICKETS_PER_EMAIL) {
        throw new Error("EMAIL_LIMIT");
      }

      const releasedTickets = await tx.ticket.findMany({
        where: { status: TICKET_STATUS.released },
        orderBy: { ticketNumber: "asc" },
        take: quantity,
      });

      const reactivatedTickets = await Promise.all(
        releasedTickets.map((ticket) =>
          tx.ticket.update({
            where: { id: ticket.id },
            data: { email, status: TICKET_STATUS.active },
          }),
        ),
      );

      const newTicketQuantity = quantity - releasedTickets.length;
      if (newTicketQuantity === 0) return reactivatedTickets;

      const startNumber = await getNextTicketNumber(tx);
      const newTickets = Array.from({ length: newTicketQuantity }, (_, i) => ({
        ticketNumber: startNumber + i,
        email,
        status: TICKET_STATUS.active,
      }));

      const createdTickets = await Promise.all(
        newTickets.map((ticket) => tx.ticket.create({ data: ticket })),
      );

      return [...reactivatedTickets, ...createdTickets];
    });

    const availability = await getTicketAvailability();

    return {
      ok: true as const,
      tickets: created,
      remaining: remainingPerEmail - quantity,
      ...availability,
    };
  } catch (error) {
    const availability = await getTicketAvailability();

    if (error instanceof Error) {
      if (error.message === "SOLD_OUT") {
        return {
          ok: false as const,
          error: "Se agotaron las entradas.",
          remaining: remainingPerEmail,
          ...availability,
        };
      }
      if (error.message.startsWith("ONLY_")) {
        const left = Number(error.message.replace("ONLY_", "").replace("_LEFT", ""));
        return {
          ok: false as const,
          error: `Solo quedan ${left} entrada(s) disponibles.`,
          remaining: remainingPerEmail,
          ...availability,
        };
      }
      if (error.message === "EMAIL_LIMIT") {
        return {
          ok: false as const,
          error: "Este correo ya tiene su entrada. Solo se permite 1 ticket por correo.",
          remaining: 0,
          ...availability,
        };
      }
    }

    throw error;
  }
}
