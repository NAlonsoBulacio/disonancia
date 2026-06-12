import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendTicketsConfirmation } from "@/lib/mail";
import { getActiveTicketRecipients } from "@/lib/tickets";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const recipients = await getActiveTicketRecipients();
    return NextResponse.json({ recipients });
  } catch (error) {
    console.error("admin confirmations list error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los correos activos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const sendAll = body.sendAll === true;
    const recipients = await getActiveTicketRecipients();
    const selectedRecipients = sendAll
      ? recipients
      : recipients.filter((recipient) => recipient.email === email);

    if (selectedRecipients.length === 0) {
      return NextResponse.json(
        { error: "No encontramos entradas activas para ese correo." },
        { status: 400 },
      );
    }

    await Promise.all(
      selectedRecipients.map((recipient) =>
        sendTicketsConfirmation(recipient.email, recipient.ticketNumbers),
      ),
    );

    return NextResponse.json({
      sent: selectedRecipients.map((recipient) => recipient.email),
    });
  } catch (error) {
    console.error("admin confirmations send error:", error);
    return NextResponse.json(
      { error: "No se pudieron enviar los correos de confirmación." },
      { status: 500 },
    );
  }
}
