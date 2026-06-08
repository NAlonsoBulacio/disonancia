import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendTicketsConfirmation } from "@/lib/mail";
import { claimTickets } from "@/lib/tickets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const quantity = Number(body.quantity ?? 0);

    if (!token) {
      return NextResponse.json(
        { error: "Sesión inválida. Volvé a verificar tu correo." },
        { status: 401 },
      );
    }

    const session = await getSession(token);
    if (!session) {
      return NextResponse.json(
        { error: "Tu sesión venció. Volvé a verificar tu correo." },
        { status: 401 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Elegí una cantidad válida de tickets." },
        { status: 400 },
      );
    }

    const result = await claimTickets(session.email, quantity);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          available: result.available,
          total: result.total,
        },
        { status: 400 },
      );
    }

    const ticketNumbers = result.tickets.map((t) => t.ticketNumber);

    try {
      await sendTicketsConfirmation(session.email, ticketNumbers);
    } catch (mailError) {
      console.error("ticket confirmation email error:", mailError);
    }

    return NextResponse.json({
      ok: true,
      tickets: ticketNumbers,
      remaining: result.remaining,
      available: result.available,
      sold: result.sold,
      total: result.total,
    });
  } catch (error) {
    console.error("claim tickets error:", error);
    return NextResponse.json(
      { error: "No pudimos reservar los tickets." },
      { status: 500 },
    );
  }
}
