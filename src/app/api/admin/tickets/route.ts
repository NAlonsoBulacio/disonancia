import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { TICKET_STATUS } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getAllTickets, getTicketStats } from "@/lib/tickets";

const allowedStatuses = new Set<string>(Object.values(TICKET_STATUS));

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const [tickets, stats] = await Promise.all([
      getAllTickets(),
      getTicketStats(),
    ]);

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        email: t.email,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      stats,
    });
  } catch (error) {
    console.error("admin tickets error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las entradas." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    const status = String(body.status ?? "");

    if (!id) {
      return NextResponse.json({ error: "Falta la entrada." }, { status: 400 });
    }

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status },
    });
    const stats = await getTicketStats();

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        email: ticket.email,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
      },
      stats,
    });
  } catch (error) {
    console.error("admin ticket update error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la entrada." },
      { status: 500 },
    );
  }
}
