import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { sendReturnInvitation } from "@/lib/mail";
import { createReturnLink } from "@/lib/returns";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const send = body.send === true;

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

    if (send) {
      await sendReturnInvitation(
        result.email,
        result.subject,
        result.body,
        result.url,
        result.tickets,
        result.quantityHint,
      );
    }

    return NextResponse.json({ ...result, sent: send });
  } catch (error) {
    console.error("admin return-link error:", error);
    return NextResponse.json(
      { error: "No se pudo generar el enlace." },
      { status: 500 },
    );
  }
}
