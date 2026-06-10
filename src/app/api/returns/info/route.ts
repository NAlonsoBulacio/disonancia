import { NextResponse } from "next/server";
import { getReturnSession } from "@/lib/returns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = String(searchParams.get("token") ?? "").trim();

    if (!token) {
      return NextResponse.json({ error: "Enlace inválido." }, { status: 400 });
    }

    const session = await getReturnSession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Enlace inválido o vencido." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      email: session.email,
      tickets: session.tickets.map((t) => t.ticketNumber),
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("returns info error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la información." },
      { status: 500 },
    );
  }
}
