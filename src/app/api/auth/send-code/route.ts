import { NextResponse } from "next/server";
import {
  createVerificationCode,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/config";
import { sendVerificationCode } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 },
      );
    }

    const recent = await prisma.verificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const secondsSince =
        (Date.now() - recent.createdAt.getTime()) / 1000;
      if (secondsSince < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince);
        return NextResponse.json(
          { error: `Esperá ${wait} segundos antes de pedir otro código.` },
          { status: 429 },
        );
      }
    }

    const code = await createVerificationCode(email);
    await sendVerificationCode(email, code);

    return NextResponse.json({
      ok: true,
      message: "Te enviamos un código de verificación a tu correo.",
    });
  } catch (error) {
    console.error("send-code error:", error);
    return NextResponse.json(
      { error: "No pudimos enviar el código. Intentá de nuevo." },
      { status: 500 },
    );
  }
}
