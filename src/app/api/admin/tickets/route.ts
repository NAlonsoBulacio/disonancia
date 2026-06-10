import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllTickets, getTicketStats } from "@/lib/tickets";

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
