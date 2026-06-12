import { NextResponse } from "next/server";
import { PUBLIC_TICKETS_CLOSED } from "@/lib/config";
import { getTicketAvailability } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const availability = await getTicketAvailability();
    return NextResponse.json(
      PUBLIC_TICKETS_CLOSED
        ? { ...availability, available: 0 }
        : availability,
    );
  } catch (error) {
    console.error("availability error:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disponibilidad." },
      { status: 500 },
    );
  }
}
