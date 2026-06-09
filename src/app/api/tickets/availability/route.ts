import { NextResponse } from "next/server";
import { getTicketAvailability } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const availability = await getTicketAvailability();
    return NextResponse.json(availability);
  } catch (error) {
    console.error("availability error:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disponibilidad." },
      { status: 500 },
    );
  }
}
