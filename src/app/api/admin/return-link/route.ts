import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { createReturnLink } from "@/lib/returns";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 },
      );
    }

    const result = await createReturnLink(email);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("admin return-link error:", error);
    return NextResponse.json(
      { error: "No se pudo generar el enlace." },
      { status: 500 },
    );
  }
}
