import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password ?? "");

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminSessionCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Error al iniciar sesión." }, { status: 500 });
  }
}
