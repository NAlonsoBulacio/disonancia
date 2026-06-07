import nodemailer from "nodemailer";
import { EVENT } from "./config";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const emailWrapper = (content: string) => `
  <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 8px;">
    <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6);">Ciclo</p>
    <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: normal; text-transform: lowercase; color: #8ed8e8;">disonancia</h1>
    ${content}
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 24px 0;" />
    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">${EVENT.venue} · ${EVENT.address}<br/>${EVENT.date} · ${EVENT.time}</p>
  </div>
`;

export async function sendVerificationCode(email: string, code: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  const subject = `Código de verificación — ${EVENT.name}`;
  const text = [
    `Tu código para sacar tickets de ${EVENT.name} es: ${code}`,
    ``,
    `${EVENT.date} · ${EVENT.time}`,
    `${EVENT.venue}, ${EVENT.address}`,
    ``,
    `El código vence en 15 minutos.`,
  ].join("\n");

  const html = emailWrapper(`
    <p style="color: rgba(255,255,255,0.7);">Tu código de verificación:</p>
    <p style="font-size: 36px; letter-spacing: 10px; font-weight: bold; color: #8ed8e8; text-align: center; padding: 20px; border: 1px solid rgba(142,216,232,0.3); border-radius: 8px; margin: 16px 0;">${code}</p>
    <p style="font-size: 13px; color: rgba(255,255,255,0.5);">Vence en 15 minutos.</p>
  `);

  if (!transporter || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Código para ${email}: ${code}`);
      return;
    }
    throw new Error("SMTP no configurado");
  }

  await transporter.sendMail({ from, to: email, subject, text, html });
}

export async function sendTicketsConfirmation(
  email: string,
  ticketNumbers: number[],
) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const numbers = ticketNumbers.map((n) => `#${String(n).padStart(4, "0")}`);

  const subject = `Tus entradas — ${EVENT.name}`;
  const text = [
    `¡Listo! Reservaste ${ticketNumbers.length} entrada(s) para ${EVENT.name}.`,
    ``,
    `Fecha: ${EVENT.date} · ${EVENT.time}`,
    `Lugar: ${EVENT.venue}, ${EVENT.address}`,
    ``,
    `Tickets: ${numbers.join(", ")}`,
    ``,
    `Presentá este correo en la entrada.`,
  ].join("\n");

  const html = emailWrapper(`
    <p style="font-size: 18px; color: #8ed8e8;">¡Entradas confirmadas!</p>
    <ul style="list-style: none; padding: 0; margin: 16px 0;">
      ${numbers.map((n) => `<li style="font-size: 22px; font-family: monospace; color: #8ed8e8; margin: 10px 0; padding: 12px; border: 1px solid rgba(142,216,232,0.3); border-radius: 6px; text-align: center;">${n}</li>`).join("")}
    </ul>
    <p style="font-size: 13px; color: rgba(255,255,255,0.5);">Presentá este correo en la entrada.</p>
  `);

  if (!transporter || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Tickets para ${email}: ${numbers.join(", ")}`);
      return;
    }
    throw new Error("SMTP no configurado");
  }

  await transporter.sendMail({ from, to: email, subject, text, html });
}
