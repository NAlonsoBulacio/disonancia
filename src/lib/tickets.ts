import { MAX_TICKETS_PER_EMAIL, MAX_TOTAL_TICKETS } from "./config";
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

export async function getTicketAvailability() {
  const sold = await prisma.ticket.count();
  const available = Math.max(0, MAX_TOTAL_TICKETS - sold);

  return {
    available,
    sold,
    total: MAX_TOTAL_TICKETS,
  };
}

export async function getTicketStats() {
  const [availability, emails] = await Promise.all([
    getTicketAvailability(),
    prisma.ticket.findMany({
      distinct: ["email"],
      select: { email: true },
    }),
  ]);

  return {
    total: availability.sold,
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
      const sold = await tx.ticket.count();
      const availableGlobal = MAX_TOTAL_TICKETS - sold;

      if (quantity > availableGlobal) {
        throw new Error(
          availableGlobal === 0
            ? "SOLD_OUT"
            : `ONLY_${availableGlobal}_LEFT`,
        );
      }

      const usedByEmail = await tx.ticket.count({ where: { email } });
      if (usedByEmail + quantity > MAX_TICKETS_PER_EMAIL) {
        throw new Error("EMAIL_LIMIT");
      }

      const startNumber = await getNextTicketNumber(tx);
      const tickets = Array.from({ length: quantity }, (_, i) => ({
        ticketNumber: startNumber + i,
        email,
      }));

      return Promise.all(
        tickets.map((ticket) => tx.ticket.create({ data: ticket })),
      );
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
