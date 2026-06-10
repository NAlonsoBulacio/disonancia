import { NextResponse } from "next/server";
import { releaseTickets } from "@/lib/returns";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const quantity = Number(body.quantity ?? 0);

    if (!token) {
      return NextResponse.json({ error: "Enlace inválido." }, { status: 400 });
    }

    const result = await releaseTickets(token, quantity);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      released: result.released,
      remaining: result.remaining,
      available: result.available,
      total: result.total,
    });
  } catch (error) {
    console.error("returns release error:", error);
    return NextResponse.json(
      { error: "No se pudieron liberar las entradas." },
      { status: 500 },
    );
  }
}
