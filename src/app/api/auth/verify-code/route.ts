import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, verifyCode } from "@/lib/auth";
import { getRemainingTicketsForEmail, getTicketsForEmail } from "@/lib/tickets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const code = String(body.code ?? "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Correo electrónico inválido." },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "El código debe tener 6 dígitos." },
        { status: 400 },
      );
    }

    const session = await verifyCode(email, code);

    if (!session) {
      return NextResponse.json(
        { error: "Código incorrecto o vencido." },
        { status: 401 },
      );
    }

    const [remaining, existingTickets] = await Promise.all([
      getRemainingTicketsForEmail(email),
      getTicketsForEmail(email),
    ]);

    return NextResponse.json({
      ok: true,
      token: session.token,
      email: session.email,
      remaining,
      tickets: existingTickets.map((t) => t.ticketNumber),
    });
  } catch (error) {
    console.error("verify-code error:", error);
    return NextResponse.json(
      { error: "No pudimos verificar el código." },
      { status: 500 },
    );
  }
}
